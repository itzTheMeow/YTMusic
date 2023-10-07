package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/types"
	"github.com/itzTheMeow/YTMusic/util"
	"github.com/oklog/ulid/v2"
)

var App *fiber.App

//go:embed dist/*
var public embed.FS

func main() {
	log.SetFlags(log.Ltime | log.Lmsgprefix)
	log.SetPrefix("=> ")
	if util.DevEnv {
		log.Printf("Starting YTMusic in development mode...")
	} else {
		log.Printf("Starting YTMusic...")
	}
	util.InitConfig()
	defer Database.Close()

	go metadata.InitSpotify()
	go metadata.InitSoundCloud()

	App = fiber.New(fiber.Config{
		DisableStartupMessage: true,
	})

	var accounts []*types.Account
	if Database.Get("accounts", &accounts) != nil {
		pass := ulid.Make().String()
		pass = strings.ToLower(pass[len(pass)-6:])
		admin := CreateAccount("admin", pass)
		admin.Permissions = types.AccountPermissions{
			Owner: true,
		}
		SetAccount(admin)
		log.Printf(fmt.Sprintf("Automatically created account \"%v\" with password \"%v\". Please change your password once logging in.", admin.Username, pass))
	}

	InitAPIMeta()
	InitAPISearch()
	InitAPIArtists()
	InitAPITracks()
	InitAPIWS()

	if !util.DevEnv {
		App.Use("/", filesystem.New(filesystem.Config{
			Root:         http.FS(public),
			NotFoundFile: "dist/index.html",
			PathPrefix:   "dist",
		}))
	} else {
		App.Use("/", filesystem.New(filesystem.Config{
			Root:         http.FS(os.DirFS(path.Join(util.Grab(os.Getwd()), "../dist"))),
			NotFoundFile: "index.html",
			PathPrefix:   "",
		}))
	}

	App.Hooks().OnListen(func() error {
		log.Printf(fmt.Sprintf("YTMusic is online and listening on port %v.", util.Config.Port))
		return nil
	})
	queue.Add(queue.QALibraryScan, nil)
	bindAddress := os.Getenv("VOPONO_HOST_IP")
	if bindAddress == "" {
		bindAddress = "0.0.0.0"
	}
	App.Listen(fmt.Sprint(bindAddress+":", util.Config.Port))
}
