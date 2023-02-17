package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/types"
)

func InitAPIArtists() {
	App.Post("/api/artist_add", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.ArtistAdd {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
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
		if a := GetAuthorizedAccount(c); a == nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		list := make([]types.Artist, 0)
		for _, a := range media.Artists {
			artist := a
			artist.Albums = nil
			list = append(list, artist)
		}
		return c.JSON(list)
	})
	App.Post("/api/artist_get", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APIArtistGetRequest
		c.BodyParser(&body)
		if body.ID == "" {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Request malformed.",
			})
		}
		for _, a := range media.Artists {
			if a.ID == body.ID {
				return c.JSON(a)
			}
		}
		return c.JSON(APIErrorResponse{
			Error:   true,
			Message: "Artist not found.",
		})
	})
	App.Post("/api/artist_remove", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.ArtistRemove {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APIArtistAddRequest
		c.BodyParser(&body)
		if body.ID == "" {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Request malformed.",
			})
		}
		queue.Add(queue.QAArtistRemove, queue.QueuedArtistRemove{
			ID: body.ID,
		})
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
}
