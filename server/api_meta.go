package main

import "github.com/gofiber/fiber/v2"

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
}
