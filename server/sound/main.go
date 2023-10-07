package sound

import (
	"errors"

	"github.com/itzTheMeow/YTMusic/types"
)

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

func Download(provider types.SoundProvider, url string) (*string, error) {
	switch provider {
	case types.SoundProviderYouTube:
		return DownloadYouTube(url)
	case types.SoundProviderSoundCloud:
		return DownloadSoundcloud(url)
	default:
		return nil, errors.New("Invalid provider ID.")
	}
}
