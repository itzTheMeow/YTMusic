package main

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/util"
	"github.com/oklog/ulid/v2"
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
	App.Post("/api/pass_change", func(c *fiber.Ctx) error {
		var body APIPasswordChangeRequest
		c.BodyParser(&body)
		account := GetAuthorizedAccount(c)
		if account == nil {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		if !CheckPasswordHash(body.Old, account.Password) {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Password is incorrect.",
			})
		}
		if body.New == "" {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "No password provided.",
			})
		}
		account.Password = HashPassword(body.New)
		account.Token = strings.ToLower(ulid.Make().String())
		SetAccount(*account)
		return c.JSON(&APIErrorResponse{
			Error: false,
		})
	})
	App.Post("/api/queue_get", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		return c.JSON(queue.Items)
	})
	App.Post("/api/settings_get", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		return c.JSON(util.UserConfig)
	})
	App.Post("/api/settings_set", func(c *fiber.Ctx) error {
		if a := GetAuthorizedAccount(c); a == nil || !a.Permissions.Owner {
			return c.JSON(APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
		var body APISettingsSetRequest
		c.BodyParser(&body)
		switch body.Key {
		case "libraryFolder":
			if body.Value == "" {
				util.UserConfig.LibraryFolder = "./Music"
			} else {
				util.UserConfig.LibraryFolder = body.Value
			}
			util.WriteConfig()
		}
		return c.JSON(APIErrorResponse{
			Error: false,
		})
	})
	App.Post("/api/scan_lib", func(c *fiber.Ctx) error {
		if GetAuthorizedAccount(c) != nil {
			queue.Add(queue.QALibraryScan, nil)
			return c.JSON(&APIErrorResponse{
				Error: false,
			})
		} else {
			return c.JSON(&APIErrorResponse{
				Error:   true,
				Message: "Unauthorized.",
			})
		}
	})
}
