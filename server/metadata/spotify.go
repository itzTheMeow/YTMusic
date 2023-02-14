package metadata

import (
	"context"
	"log"

	"github.com/itzTheMeow/YTMusic/util"
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

func SearchSpotifyArtists(query string) {
	if SpotifyClient != nil {
		SpotifyClient.Search(ctx, query, spotify.SearchTypeArtist)
	}
}
