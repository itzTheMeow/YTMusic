package media

import (
	"errors"

	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
)

func GetTrack(artistID string, albumID string, trackID string) (*types.Artist, *types.Album, *types.Track, error) {
	var (
		artist types.Artist
		album  types.Album
		track  types.Track
	)
	i := slices.IndexFunc(Artists, func(a types.Artist) bool {
		return a.ID == artistID
	})
	if i == -1 {
		return nil, nil, nil, errors.New("Artist not found.")
	}
	artist = Artists[i]
	i = slices.IndexFunc(artist.Albums, func(a types.Album) bool {
		return a.ID == albumID
	})
	if i == -1 {
		return nil, nil, nil, errors.New("Album not found.")
	}
	album = artist.Albums[i]
	i = slices.IndexFunc(album.Tracks, func(t types.Track) bool {
		return t.ID == trackID
	})
	if i == -1 {
		return nil, nil, nil, errors.New("Track not found.")
	}
	track = album.Tracks[i]
	return &artist, &album, &track, nil
}
