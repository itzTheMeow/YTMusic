package sound

import (
	"errors"
	"io"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/levigross/grequests"
	"github.com/oklog/ulid/v2"
)

type pipedAPISearchResponse struct {
	URL        string `json:"url"`  // is "/watch?v=VIDEO_ID"
	Type       string `json:"type"` // enforce "stream"
	Title      string `json:"title"`
	Thumbnail  string `json:"thumbnail"`
	AuthorName string `json:"uploaderName"`
	AuthorURL  string `json:"uploaderUrl"` // is "/channel/CHANNEL_ID"
	AuthorIcon string `json:"uploaderAvatar"`
	Duration   int    `json:"duration"`
	Views      int    `json:"views"`
	UploadedAt int    `json:"uploaded"`
	IsShort    bool   `json:"isShort"` // enforce "false"
	// ignore uploadedDate, shortDescription, uploaderVerified
}

func SearchYoutube(query string) []types.Downloadable {
	res, err := grequests.Get("https://pipedapi.tokhmi.xyz/search", &grequests.RequestOptions{
		Params: map[string]string{
			"q":      query,
			"filter": "videos",
		},
	})
	if err != nil {
		log.Println("Error fetching youtube search results.", err)
		return make([]types.Downloadable, 0)
	}
	var body struct {
		Items []pipedAPISearchResponse `json:"items"`
	}
	res.JSON(&body)
	list := make([]types.Downloadable, 0)
	for _, vid := range body.Items {
		if vid.Type == "stream" && !vid.IsShort {
			list = append(list, ConstructDownloadableFromYouTube(vid))
		}
	}
	return list
}

func ConstructDownloadableFromYouTube(vid pipedAPISearchResponse) types.Downloadable {
	if vid.Duration == -1 {
		vid.Duration = 0
	}
	if vid.UploadedAt == -1 {
		vid.UploadedAt = int(time.Now().UnixMilli())
	}
	return types.Downloadable{
		Title:      vid.Title,
		Duration:   vid.Duration * 1000,
		UploadedAt: vid.UploadedAt,
		Views:      vid.Views,
		Thumbnail:  vid.Thumbnail,
		Author: types.DownloadableAuthor{
			Name: vid.AuthorName,
			Icon: vid.AuthorIcon,
			URL:  "https://youtube.com" + vid.AuthorURL,
		},
		URL:   "https://youtube.com" + vid.URL,
		Embed: "https://youtube.com" + strings.Replace(vid.URL, "/watch?v=", "/embed/", 1),
	}
}

func DownloadYouTube(url string) (*string, error) {
	filepath := path.Join(os.TempDir(), ulid.Make().String())

	result, err := DownloadURL(url)
	if err != nil {
		return nil, err
	}
	file, err := os.Create(filepath)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	written, err := io.Copy(file, result)
	if err != nil {
		return nil, err
	}
	if written == 0 {
		return nil, errors.New("Failed to download video.")
	}
	return &filepath, nil
}
