package media

import (
	"fmt"
	"os"
	"path"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	strings "gopkg.in/goyy/goyy.v0/util/strings"
)

func Location() string {
	var loc string
	if len(util.UserConfig.LibraryFolder) > 0 {
		if strings.HasPrefix(util.UserConfig.LibraryFolder, ".") {
			loc = path.Join(util.Config.BasePath, util.UserConfig.LibraryFolder)
		} else {
			loc = path.Clean(util.UserConfig.LibraryFolder)
		}
	} else {
		loc = path.Join(util.Config.BasePath, "Music")
	}
	os.Mkdir(loc, os.ModePerm)
	return loc
}
func ArtistPath(artist types.Artist) string {
	return path.Join(Location(), SanitizeFileName(artist.Name))
}
func AlbumPath(artist types.Artist, album types.Album) string {
	return path.Join(ArtistPath(artist), SanitizeFileName(album.Name))
}
func TrackName(track types.Track) string {
	return fmt.Sprintf(`%v - %v.mp3`, strings.PadLeft(fmt.Sprint(track.Number), 2, "0"), SanitizeFileName(track.Title))
}
func TrackPath(artist types.Artist, album types.Album, track types.Track) string {
	return path.Join(AlbumPath(artist, album), TrackName(track))
}
