package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/types"
)

func InitAPIArtists() {
	App.Post("/api/artist_add", func(c *fiber.Ctx) error {
		var body APIArtistAddRequest
		c.BodyParser(&body)
		if body.ID == "" || body.Provider == "" {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Request malformed.",
			})
		}
		queue.Add(queue.QAArtistAdd, queue.QueuedArtistAdd{
			ID:       body.ID,
			Provider: body.Provider,
		})
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
	App.Post("/api/artist_list", func(c *fiber.Ctx) error {
		list := make([]types.Artist, 0)
		for _, a := range media.Artists {
			artist := a
			artist.Albums = nil
			list = append(list, artist)
		}
		return c.JSON(list)
	})
}
