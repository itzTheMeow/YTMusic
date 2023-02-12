package main

import "github.com/gofiber/fiber/v2"

func InitAPIMeta() {
	App.Post("/api/login", func(c *fiber.Ctx) error {
		var body APILoginRequest
		c.BodyParser(&body)
		account := GetAccount(body.Username)
		if Database.Get("account", &account) != nil {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Account does not exist.",
			})
		}
		if !CheckPasswordHash(body.Password, account.password) {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Invalid password.",
			})
		}
		return c.JSON(account)
	})
}
