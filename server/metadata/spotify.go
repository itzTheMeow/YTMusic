package metadata

import (
	"context"
	"log"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	"github.com/oklog/ulid/v2"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/oauth2/clientcredentials"
)

var ctx context.Context
var SpotifyClient *spotify.Client

func InitSpotify() {
	ctx = context.Background()
	credentials := &clientcredentials.Config{
		ClientID:     util.UserConfig.SpotifyClientID,
		ClientSecret: util.UserConfig.SpotifyClientSecret,
		TokenURL:     spotifyauth.TokenURL,
	}
	token, err := credentials.Token(ctx)
	if err != nil {
		log.Printf("Couldn't get token for spotify: %v", err)
	} else {
		log.Print("Obtained spotify access token.")
		SpotifyClient = spotify.New(spotifyauth.New().Client(ctx, token))
	}
}

func SearchSpotifyArtists(query string) []types.Artist {
	artists := make([]types.Artist, 0)
	if SpotifyClient != nil {
		res, err := SpotifyClient.Search(ctx, query, spotify.SearchTypeArtist, spotify.Limit(15))
		if err == nil {
			for _, artist := range res.Artists.Artists {
				artists = append(artists, ConstructArtistFromSpotify(artist))
			}
		} else {
			log.Println(err)
		}
	}
	return artists
}

func findImage(images []spotify.Image) string {
	for _, img := range images {
		if img.Width == img.Height {
			return img.URL
		}
	}
	if len(images) > 0 {
		return images[0].URL
	} else {
		return ""
	}
}

func ConstructArtistFromSpotify(artist spotify.FullArtist) types.Artist {
	providers := make(map[types.MetadataProvider]string)
	providers[types.MetaProviderSpotify] = artist.ID.String()
	return types.Artist{
		ID:        ulid.Make().String(),
		Name:      artist.Name,
		URL:       artist.ExternalURLs["spotify"],
		Genres:    artist.Genres,
		Followers: int(artist.Followers.Count),
		Icon:      findImage(artist.Images),
		Providers: providers,
	}
}

/*
func ConstructAlbumFromSpotify(album: SpotifyApi.AlbumObjectSimplified): Album {
  return {
    type: (album.album_type as any) || "",
    url: album.external_urls.spotify || "",
    id: ulid(),
    name: album.name || "",
    year: Number(album.release_date.split("-")[0]) || 0,
    image: findImage(album.images),
    tracks: [],
    uuid: album.id || "",
    provider: MetadataProviders.Spotify,
  };
}

func ConstructTrackFromSpotify(track: SpotifyApi.TrackObjectSimplified): Track {
  return {
    id: track.id,
    uuid: track.id,
    title: track.name || "",
    url: track.external_urls.spotify || "",
    number: track.track_number || 0,
    duration: track.duration_ms || 0,
    explicit: track.explicit || false,
  };
}
*/
