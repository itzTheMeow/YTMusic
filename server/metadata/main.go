package metadata

import (
	"errors"

	"github.com/itzTheMeow/YTMusic/types"
)

func Search(provider types.MetadataProvider, query string) []types.Artist {
	switch provider {
	case types.MetaProviderSpotify:
		return SearchSpotifyArtists(query)
	case types.MetaProviderSoundCloud:
		return SearchSoundCloudArtists(query)
	case types.MetaProviderBandLab:
		return SearchBandLabArtists(query)
	default:
		return nil
	}
}
func Fetch(provider types.MetadataProvider, id string) (*types.Artist, error) {
	switch provider {
	case types.MetaProviderSpotify:
		return FetchSpotifyArtist(id)
	case types.MetaProviderSoundCloud:
		return FetchSoundCloudArtist(id)
	case types.MetaProviderBandLab:
		return FetchBandLabArtist(id)
	default:
		return nil, errors.New("Invalid provider ID.")
	}
}
