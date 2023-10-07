package sound

import "github.com/itzTheMeow/YTMusic/types"

func Search(provider types.SoundProvider, query string) []types.Downloadable {
	switch provider {
	case types.SoundProviderYouTube:
		return SearchYoutube(query)
	case types.SoundProviderSoundCloud:
		return SearchSoundCloud(query)
	default:
		return nil
	}
}
