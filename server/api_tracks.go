package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
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
		var (
			artist types.Artist
			album  types.Album
			track  types.Track
		)
		i := slices.IndexFunc(media.Artists, func(a types.Artist) bool {
			return a.ID == body.Artist
		})
		if i == -1 {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Artist not found.",
			})
		}
		artist = media.Artists[i]
		i = slices.IndexFunc(artist.Albums, func(a types.Album) bool {
			return a.ID == body.Album
		})
		if i == -1 {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Album not found.",
			})
		}
		album = artist.Albums[i]
		i = slices.IndexFunc(album.Tracks, func(t types.Track) bool {
			return t.ID == body.Track
		})
		if i == -1 {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Track not found.",
			})
		}
		track = album.Tracks[i]
		if body.URL == "" || body.Provider == "" {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Request malformed.",
			})
		}
		queue.Add(queue.QASongDownload, queue.QueuedSongDownload{
			Artist:   artist,
			Album:    album,
			Track:    track,
			Provider: body.Provider,
			URL:      body.URL,
		})
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
}
