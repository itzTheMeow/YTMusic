package main

import "github.com/gofiber/fiber/v2"

func InitAPISearch() {
	App.Post("/api/artist_search", func(c *fiber.Ctx) error {
		return
	})
}
