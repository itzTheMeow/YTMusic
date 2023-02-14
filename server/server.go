package main

import (
	"fmt"
	"log"
	"path"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/util"
	"github.com/oklog/ulid/v2"
)

var App *fiber.App

func main() {
	log.SetFlags(log.Ltime | log.Lmsgprefix)
	log.SetPrefix("=> ")
	log.Printf("Starting YTMusic...")
	util.InitConfig()
	metadata.InitSpotify()
	App = fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	var accounts []*Account
	if Database.Get("accounts", &accounts) != nil {
		pass := ulid.Make().String()
		pass = strings.ToLower(pass[len(pass)-6:])
		admin := CreateAccount("admin", pass)
		log.Printf(fmt.Sprintf("Automatically created account \"%v\" with password \"%v\". Please change your password once logging in.", admin.Username, pass))
	}

	InitAPIMeta()
	App.Static("/", path.Join(util.Config.BasePath, "public"))
	App.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile(path.Join(util.Config.BasePath, "index.html"))
	})

	App.Hooks().OnListen(func() error {
		log.Printf(fmt.Sprintf("Server listening on port %v.", util.Config.Port))
		return nil
	})
	App.Listen(fmt.Sprint(":", util.Config.Port))
}
