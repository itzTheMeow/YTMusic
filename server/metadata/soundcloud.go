package metadata

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	soundcloud "github.com/juanefec/soundcloud-api"
	"github.com/oklog/ulid/v2"
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

func FetchSoundCloudArtist(id string) (*types.Artist, error) {
	if SoundCloudClient != nil {
		user, err := SoundCloudClient.GetUser(soundcloud.GetUserOptions{
			ID: int64(util.Grab(strconv.Atoi(id))),
		})
		if err != nil {
			return nil, err
		}
		artist := ConstructArtistFromSoundCloud(user)
		list, err := SoundCloudClient.GetTracklist(soundcloud.GetTracklistOptions{
			ID:    user.ID,
			Type:  "tracklist",
			Limit: 9999, // doubt theres any artists with over 9999 tracks (or that you'd want to disk-cache that many)
		})
		if err != nil {
			return nil, err
		}
		tracks, err := list.GetTracks()
		if err != nil {
			return nil, err
		}
		for _, track := range tracks {
			artist.Albums = append(artist.Albums, ConstructTrackAlbumFromSoundCloud(track))
		}
		return &artist, nil
	} else {
		return nil, errors.New("SoundCloud not enabled.")
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

func ConstructTrackAlbumFromSoundCloud(track soundcloud.Track) types.Album {
	artwork := track.ArtworkURL
	if artwork == "" {
		artwork = track.User.AvatarURL
	}
	return types.Album{
		Type:  "single",
		URL:   track.PermalinkURL,
		ID:    ulid.Make().String(),
		Name:  track.Title,
		Year:  util.Grab(time.Parse("2006-01-02T15:04:05Z", track.CreatedAt)).Year(),
		Image: strings.Replace(artwork, "-large", "-t500x500", 1),
		UUID:  "alb" + fmt.Sprint(track.ID),
		Tracks: append(make([]types.Track, 0), types.Track{
			ID:       ulid.Make().String(),
			UUID:     fmt.Sprint(track.ID),
			Title:    track.Title,
			URL:      track.PermalinkURL,
			Number:   1,
			Duration: int(track.FullDurationMS),
			Explicit: false,
		}),
		Provider: types.MetaProviderSoundCloud,
	}
}
