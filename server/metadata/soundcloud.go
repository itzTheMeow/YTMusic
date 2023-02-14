package metadata

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/oklog/ulid/v2"
	soundcloud "github.com/zackradisic/soundcloud-api"
)

var SoundCloudClient *soundcloud.API

func InitSoundCloud() {
	client, err := soundcloud.New(soundcloud.APIOptions{})
	if err != nil {
		log.Printf("Failed to init SoundCloud. %v", err)
		return
	} else {
		SoundCloudClient = client
		log.Printf("Initialized soundcloud api.")
	}
}

func SearchSoundCloudArtists(query string) []types.Artist {
	artists := make([]types.Artist, 0)
	if SoundCloudClient != nil {
		res, err := SoundCloudClient.Search(soundcloud.SearchOptions{
			Query: query,
			Limit: 12,
			Kind:  soundcloud.KindUser,
		})
		if err == nil {
			for _, item := range res.Collection {
				artist := soundcloud.User{}
				b, err := json.Marshal(item)
				if err != nil {
					continue
				}
				err = json.Unmarshal(b, &artist)
				if err != nil {
					continue
				}
				artists = append(artists, ConstructArtistFromSoundCloud(artist))
			}
		} else {
			log.Println(err)
		}
	}
	return artists
}

func ConstructArtistFromSoundCloud(artist soundcloud.User) types.Artist {
	providers := make(map[types.MetadataProvider]string)
	providers[types.MetaProviderSoundCloud] = fmt.Sprint(artist.ID)
	return types.Artist{
		ID:        ulid.Make().String(),
		Name:      artist.Username,
		URL:       artist.PermalinkURL,
		Genres:    make([]string, 0),
		Followers: int(artist.FollowersCount),
		Icon:      artist.AvatarURL,
		Providers: providers,
	}
}
