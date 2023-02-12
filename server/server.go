package main

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(&Account{
			Username: "Meow",
			password: "",
			Token:    "token",
			Permissions: &AccountPermissions{
				Owner:        false,
				ArtistAdd:    false,
				ArtistRemove: false,
				SongDownload: false,
				SongRemove:   false,
			},
		})
	})

	app.Listen(fmt.Sprint(":", Config.port))
}
