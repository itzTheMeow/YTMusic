package main

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/oklog/ulid/v2"
)

var App *fiber.App

func main() {
	App = fiber.New()

	var accounts []interface{}
	if Database.Get("accounts", &accounts) != nil {
		pass := ulid.Make().String()
		pass = strings.ToLower(pass[len(pass)-6:])
		admin := CreateAccount("admin", pass)
		print(fmt.Sprintf("Automatically created account \"%v\" with password \"%v\". Please change your password once logging in.", admin.Username, admin.password))
	}

	InitAPIMeta()

	App.Listen(fmt.Sprint(":", Config.port))
}
