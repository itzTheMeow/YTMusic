package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/queue"
)

func InitAPITracks() {
	App.Post("/api/track_add", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.SongDownload {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APITrackAddRequest
		c.BodyParser(&body)
		artist, album, track, err := media.GetTrack(body.Artist, body.Album, body.Track)
		if err != nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: fmt.Sprint(err),
			})
		}
		if body.URL == "" || body.Provider == "" {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Request malformed.",
			})
		}
		queue.Add(queue.QASongDownload, queue.QueuedSongDownload{
			Artist:   *artist,
			Album:    *album,
			Track:    *track,
			Provider: body.Provider,
			URL:      body.URL,
		})
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
	App.Post("/api/track_delete", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.SongRemove {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APITrackDeleteRequest
		c.BodyParser(&body)
		artist, album, track, err := media.GetTrack(body.Artist, body.Album, body.Track)
		if err != nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: fmt.Sprint(err),
			})
		}
		queue.Add(queue.QASongDelete, queue.QueuedSongDelete{
			Artist: *artist,
			Album:  *album,
			Track:  *track,
		})
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
}
