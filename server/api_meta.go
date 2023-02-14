package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/queue"
)

func InitAPIMeta() {
	App.Post("/api/login", func(c *fiber.Ctx) error {
		var body APILoginRequest
		c.BodyParser(&body)
		account := GetAccountName(body.Username)
		if account == nil {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Account does not exist.",
			})
		}
		if !CheckPasswordHash(body.Password, account.Password) {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid password.",
			})
		}
		return c.JSON(&APILoginResponse{
			Token: account.Token,
		})
	})
	App.Post("/api/has_auth", func(c *fiber.Ctx) error {
		if GetAuthorizedAccount(c) != nil {
			return c.JSON(&APIErrorResponse{
				Error: false,
			})
		} else {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid authorization token.",
			})
		}
	})
	App.Post("/api/queue_get", func(c *fiber.Ctx) error {
		if GetAuthorizedAccount(c) != nil {
			return c.JSON(queue.Items)
		} else {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Unauthorized",
			})
		}
	})
}
