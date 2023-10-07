package metadata

import "github.com/itzTheMeow/YTMusic/types"

func Search(provider types.MetadataProvider, query string) []types.Artist {
	switch provider {
	case types.MetaProviderSpotify:
		return SearchSpotifyArtists(query)
	case types.MetaProviderSoundCloud:
		return SearchSoundCloudArtists(query)
	default:
		return nil
	}
}
