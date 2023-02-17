package media

import (
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
)

var Artists []types.Artist

func HasArtist(artist types.Artist) bool {
	return slices.IndexFunc(Artists, func(a types.Artist) bool {
		if artist.ID == a.ID {
			return true
		}
		if artist.Name == a.Name {
			for k, v := range artist.Providers {
				if a.Providers[k] != "" && a.Providers[k] == v {
					return true
				}
			}
		}
		return false
	}) != -1
}
