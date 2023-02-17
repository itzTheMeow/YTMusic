package sound

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path"
	"time"

	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	soundcloud "github.com/juanefec/soundcloud-api"
	"github.com/oklog/ulid/v2"
)

func SearchSoundCloud(query string) []types.Downloadable {
	list := make([]types.Downloadable, 0)
	if metadata.SoundCloudClient == nil {
		return list
	}
	res, err := metadata.SoundCloudClient.Search(soundcloud.SearchOptions{
		Query: query,
		Limit: 12,
		Kind:  soundcloud.KindTrack,
	})
	if err == nil {
		for _, item := range res.Collection {
			track := soundcloud.Track{}
			b, err := json.Marshal(item)
			if err != nil {
				continue
			}
			err = json.Unmarshal(b, &track)
			if err != nil {
				continue
			}
			list = append(list, ConstructDownloadableFromSoundCloud(track))
		}
	} else {
		log.Println(err)
	}
	return list
}

func ConstructDownloadableFromSoundCloud(track soundcloud.Track) types.Downloadable {
	thumb := track.ArtworkURL
	if thumb == "" {
		thumb = track.User.AvatarURL
	}
	return types.Downloadable{
		Title:      track.Title,
		Duration:   int(track.FullDurationMS),
		UploadedAt: int(util.Grab(time.Parse("2006-01-02T15:04:05Z", track.CreatedAt)).UnixMilli()),
		Views:      int(track.PlaybackCount),
		Thumbnail:  thumb,
		Author: types.DownloadableAuthor{
			Name: track.User.Username,
			Icon: track.User.AvatarURL,
			URL:  track.User.PermalinkURL,
		},
		URL:   track.PermalinkURL,
		Embed: fmt.Sprintf(`https://w.soundcloud.com/player/?url=https%%3A//api.soundcloud.com/tracks/%v&color=%%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`, track.ID),
	}
}

func DownloadSoundcloud(url string) (*string, error) {
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
		return nil, errors.New("Failed to download track.")
	}
	return &filepath, nil
}
