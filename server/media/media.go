package media

import (
	"fmt"
	"path"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	strings "gopkg.in/goyy/goyy.v0/util/strings"
)

func Location() string {
	return path.Join(util.Config.BasePath, util.UserConfig.LibraryLocation)
}
func ArtistPath(artist types.Artist) string {
	return path.Join(Location(), SanitizeFileName(artist.Name))
}
func AlbumPath(artist types.Artist, album types.Album) string {
	return path.Join(ArtistPath(artist), SanitizeFileName(album.Name))
}
func TrackPath(artist types.Artist, album types.Album, track types.Track) string {
	return path.Join(AlbumPath(artist, album), fmt.Sprintf(`%v - %v.mp3`, strings.PadLeft(fmt.Sprint(track.Number), 2, "0"), SanitizeFileName(track.Title)))
}