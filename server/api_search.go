package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/types"
)

func InitAPISearch() {
	App.Post("/api/artist_search", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APIArtistSearchRequest
		c.BodyParser(&body)
		var artists []types.Artist
		switch body.Provider {
		case types.MetaProviderSpotify:
			artists = metadata.SearchSpotifyArtists(body.Query)
		case types.MetaProviderSoundCloud:
			artists = metadata.SearchSoundCloudArtists(body.Query)
		default:
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid provider ID.",
			})
		}
		return c.JSON(artists)
	})
}
