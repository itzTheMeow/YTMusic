package metadata

import (
	"context"
	"log"

	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	"github.com/oklog/ulid/v2"
	"github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
	"golang.org/x/exp/slices"
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

func FetchSpotifyArtist(id string) (*types.Artist, error) {
	spotifyArtist, err := SpotifyClient.GetArtist(ctx, spotify.ID(id))
	if err != nil {
		return nil, err
	}

	artist := ConstructArtistFromSpotify(*spotifyArtist)
	artist.Albums = make([]types.Album, 0)

	err = runAlbumSet(&artist, 0)
	if err != nil {
		return nil, err
	}

	return &artist, nil
}
func runAlbumSet(artist *types.Artist, off int) error {
	albums, err := SpotifyClient.GetArtistAlbums(ctx, spotify.ID(artist.ID), append(make([]spotify.AlbumType, 0), spotify.AlbumTypeAlbum, spotify.AlbumTypeAppearsOn, spotify.AlbumTypeSingle), spotify.Limit(50), spotify.Offset(off))
	if err != nil {
		return err
	}
	for _, album := range albums.Albums {
		if album.AlbumType != "compilation" && slices.IndexFunc(artist.Albums, func(a types.Album) bool {
			return a.Name == album.Name
		}) == -1 {
			artist.Albums = append(artist.Albums, ConstructAlbumFromSpotify(album))
		}
	}
	if len(albums.Albums) == 50 {
		return runAlbumSet(artist, off+50)
	}
	return nil
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
func ConstructAlbumFromSpotify(album spotify.SimpleAlbum) types.Album {
	return types.Album{
		Type:     types.AlbumType(album.AlbumType),
		URL:      album.ExternalURLs["spotify"],
		ID:       ulid.Make().String(),
		Name:     album.Name,
		Year:     album.ReleaseDateTime().Year(),
		Image:    findImage(album.Images),
		Tracks:   make([]types.Track, 0),
		UUID:     album.ID.String(),
		Provider: types.MetaProviderSpotify,
	}
}
func ConstructTrackFromSpotify(track spotify.FullTrack) types.Track {
	return types.Track{
		ID:       ulid.Make().String(),
		UUID:     track.ID.String(),
		Title:    track.Name,
		URL:      track.ExternalURLs["spotify"],
		Number:   track.TrackNumber,
		Duration: int(track.TimeDuration().Milliseconds()),
		Explicit: track.Explicit,
	}
}
