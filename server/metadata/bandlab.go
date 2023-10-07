package metadata

import (
	"encoding/json"
	"net/http"
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
