package main

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/sound"
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
)

func InitAPISearch() {
	App.Post("/api/artist_search", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.ArtistAdd {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APIArtistSearchRequest
		c.BodyParser(&body)
		artists := metadata.Search(body.Provider, body.Query)
		if artists == nil {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid provider ID.",
			})
		}
		for i, res := range artists {
			if media.HasArtist(res) {
				artists[i].Status = types.ArtistIsPresent
			} else if slices.IndexFunc(queue.Items, func(i *queue.QueueItem) bool {
				if i.Type != queue.QAArtistAdd {
					return false
				}
				var d queue.QueuedArtistAdd
				json.Unmarshal(i.Data, &d)
				for pi, p := range res.Providers {
					if pi == d.Provider && p == d.ID {
						return true
					}
				}
				return false
			}) != -1 {
				artists[i].Status = types.ArtistIsQueued
			}
		}
		return c.JSON(artists)
	})
	App.Post("/api/track_search", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.SongDownload {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APITrackSearchRequest
		c.BodyParser(&body)
		list := sound.Search(body.Provider, body.Query)
		if list == nil {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid provider ID.",
			})
		}
		return c.JSON(list)
	})
}
