package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/queue"
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
}
