package metadata

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/oklog/ulid/v2"
)

type BandLabPicture struct {
	Large  string `json:"l"`
	Medium string `json:"m"`
	Small  string `json:"s"`
	URL    string `json:"url"`
	XSmall string `json:"xs"`
}

type BandLabArtist struct {
	About    string `json:"about"`
	Counters struct {
		Bands       int `json:"bands"`
		Collections int `json:"collections"`
		Followers   int `json:"followers"`
		Following   int `json:"following"`
		Plays       int `json:"plays"`
	} `json:"counters"`
	CreatedOn string `json:"createdOn"`
	Genres    [](struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}) `json:"genres"`
	ID      string         `json:"id"`
	Name    string         `json:"name"`
	Picture BandLabPicture `json:"picture"`
	Skills  [](struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}) `json:"skills"`
	Username string `json:"username"`
}

type BandLabAlbum struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Picture     BandLabPicture `json:"picture"`
	ReleaseDate string         `json:"releaseDate"` // format: YYYY-MM-DD
	Type        string         `json:"type"`        // enforce "Album"

	// these fields don't exist on the album overview
	Artist      BandLabArtist `json:"artist"`
	Description string        `json:"description"`
	Tracks      [](struct {
		AudioUrl   string `json:"audioUrl"`
		Duration   int    `json:"duration"`
		ID         string `json:"id"`
		IsExplicit bool   `json:"isExplicit"`
		Name       string `json:"name"`
	}) `json:"tracks"`
}

type BandLabPost struct {
	CreatedOn  string        `json:"createdOn"` // format: YYYY-MM-DDT:Z";
	Creator    BandLabArtist `json:"creator"`
	ID         string        `json:"id"`
	IsExplicit bool          `json:"isExplicit"`
	Track      struct {
		Name    string `json:"name"`
		Picture BandLabPicture
		Sample  struct {
			AudioFormat string `json:"audioFormat"`
			AudioURL    string `json:"audioUrl"`
			Duration    int    `json:"duration"`
		}
	} `json:"track"`
	Type string `json:"type"` // enforce "Track"
}

type Fetchable interface {
	BandLabArtist | BandLabAlbum | BandLabPost
}

type BandLabPaging struct {
	Cursors struct {
		After string `json:"after"`
	} `json:"cursors"`
}
type BandLabResponse[T Fetchable] struct {
	Data   T             `json:"data"`
	Paging BandLabPaging `json:"paging"`
}
type BandLabRollingResponse[T Fetchable] struct {
	Data   []T           `json:"data"`
	Paging BandLabPaging `json:"paging"`
}

const API = "https://bandlab.com/api/v1.3"

func rollingRequest[T Fetchable](URL string) []T {
	var data []T = make([]T, 0)
	var cursor string = ""
	for {
		url := URL
		if cursor != "" {
			url += "&after=" + cursor
		}
		var res, err = http.Get(url)
		if err != nil {
			break
		}
		defer res.Body.Close()

		var payload BandLabRollingResponse[T]
		json.NewDecoder(res.Body).Decode(&payload)

		data = append(data, payload.Data...)
		cursor = payload.Paging.Cursors.After
		if cursor == "" {
			break
		}
	}
	return data
}

func SearchBandLabArtists(query string) []types.Artist {
	res, err := http.Get(fmt.Sprintf("%v/users/%v", API, query))
	if err != nil {
		return make([]types.Artist, 0)
	}
	var payload BandLabArtist
	json.NewDecoder(res.Body).Decode(&payload)
	return append(make([]types.Artist, 0), ConstructArtistFromBandLab(payload))
}

func FetchBandLabArtist(id string) (*types.Artist, error) {
	res, err := http.Get(fmt.Sprintf("%v/users/%v", API, id))
	if err != nil {
		return nil, err
	}
	var bartist BandLabArtist
	json.NewDecoder(res.Body).Decode(&bartist)
	artist := ConstructArtistFromBandLab(bartist)

	albumList := rollingRequest[BandLabAlbum](fmt.Sprintf("%v/users/%v/albums?limit=100&state=Released", API, bartist.ID))
	for _, alb := range albumList {
		res, err := http.Get(fmt.Sprintf("%v/albums/%v", API, alb.ID))
		if err != nil {
			continue
		}
		var payload BandLabAlbum
		json.NewDecoder(res.Body).Decode(&payload)
		artist.Albums = append(artist.Albums, ConstructTrackAlbumFromBandLab(payload))
	}

	trackList := rollingRequest[BandLabPost](fmt.Sprintf("%v/users/%v/track-posts?limit=100", API, bartist.ID))
	for _, track := range trackList {
		// detect if there are any duplicate tracks already added from an album
		found := false
		for _, alb := range artist.Albums {
			for _, trk := range alb.Tracks {
				if trk.UUID == track.ID {
					found = true
				}
			}
		}
		if found {
			continue
		}

		artist.Albums = append(artist.Albums, ConstructPostTrackFromBandLab(track))
	}

	return &artist, nil
}

func ConstructArtistFromBandLab(artist BandLabArtist) types.Artist {
	genres := make([]string, 0)
	for _, genre := range artist.Genres {
		genres = append(genres, genre.Name)
	}
	providers := make(map[types.MetadataProvider]string)
	providers[types.MetaProviderBandLab] = artist.ID
	return types.Artist{
		ID:        ulid.Make().String(),
		Name:      artist.Name,
		URL:       "https://bandlab.com/" + artist.Username,
		Genres:    genres,
		Followers: artist.Counters.Followers,
		Icon:      artist.Picture.Small,
		Providers: providers,
	}
}
func ConstructTrackAlbumFromBandLab(album BandLabAlbum) types.Album {
	tracks := make([]types.Track, 0)
	for i, track := range album.Tracks {
		tracks = append(tracks, types.Track{
			ID:       ulid.Make().String(),
			Title:    track.Name,
			UUID:     track.ID,
			Explicit: track.IsExplicit,
			URL:      "https://bandlab.com/post/" + track.ID,
			Number:   i + 1,
			Duration: int(math.Floor(float64(track.Duration * 1000))),
		})
	}

	year, err := strconv.Atoi(strings.Split(album.ReleaseDate, "-")[0])
	if err != nil {
		year = time.Now().Year()
	}

	return types.Album{
		ID:       ulid.Make().String(),
		UUID:     album.ID,
		Type:     "album",
		Name:     album.Name,
		URL:      fmt.Sprintf("https://bandlab.com/%v/albums/%v", album.Artist.Username, album.ID),
		Image:    album.Picture.Medium,
		Year:     year,
		Provider: types.MetaProviderBandLab,
		Tracks:   tracks,
	}
}
func ConstructPostTrackFromBandLab(post BandLabPost) types.Album {
	year, err := strconv.Atoi(strings.Split(post.CreatedOn, "-")[0])
	if err != nil {
		year = time.Now().Year()
	}

	return types.Album{
		ID:       ulid.Make().String(),
		UUID:     post.ID,
		Type:     "single",
		Name:     post.Track.Name,
		URL:      "https://bandlab.com/post/" + post.ID,
		Image:    post.Track.Picture.Medium,
		Year:     year,
		Provider: types.MetaProviderBandLab,
		Tracks: append(make([]types.Track, 0), types.Track{
			ID:       ulid.Make().String(),
			Title:    post.Track.Name,
			UUID:     post.ID,
			Explicit: post.IsExplicit,
			URL:      "https://bandlab.com/post/" + post.ID,
			Number:   1,
			Duration: int(math.Floor(float64(post.Track.Sample.Duration * 1000))),
		}),
	}
}
