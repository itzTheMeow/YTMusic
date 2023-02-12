package main

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/oklog/ulid/v2"
)

var App *fiber.App

func main() {
	fmt.Println("Starting YTMusic...")
	App = fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	var accounts []*Account
	if Database.Get("accounts", &accounts) != nil {
		pass := ulid.Make().String()
		pass = strings.ToLower(pass[len(pass)-6:])
		admin := CreateAccount("admin", pass)
		fmt.Println(fmt.Sprintf("Automatically created account \"%v\" with password \"%v\". Please change your password once logging in.", admin.Username, pass))
	}

	InitAPIMeta()

	App.Hooks().OnListen(func() error {
		fmt.Println(fmt.Sprintf("Server listening on port %v.", Config.port))
		return nil
	})
	App.Listen(fmt.Sprint(":", Config.port))
}
