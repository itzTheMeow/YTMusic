package media

import (
	"path"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
)

func Location() string {
	return path.Join(util.Config.BasePath, util.UserConfig.LibraryLocation)
}
func ArtistPath(artist types.Artist) string {
	return path.Join(Location(), SanitizeFileName(artist.Name))
}
