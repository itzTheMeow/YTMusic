package main

import (
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/itzTheMeow/YTMusic/util"
	"golang.org/x/exp/slices"
)

var Sockets []*websocket.Conn

func InitAPIWS() {
	queue.OnUpdate(func(add bool, i *queue.QueueItem) {
		term := "add"
		if !add {
			term = "remove"
		}
		for _, sock := range Sockets {
			if err := sock.WriteMessage(websocket.TextMessage, util.Grab(json.Marshal(WSPacket{
				Type: term,
				Data: string(util.Grab(json.Marshal(i))),
			}))); err != nil {
				log.Println("Failed write to ws.", err)
				break
			}
		}
	})

	App.Get("/ws", websocket.New(func(c *websocket.Conn) {
		Sockets = append(Sockets, c)
		c.SetCloseHandler(func(_ int, _ string) error {
			i := slices.Index(Sockets, c)
			if i >= 0 {
				Sockets = append(Sockets[:i], Sockets[i+1:]...)
			}
			return nil
		})
		var (
			mt  int
			msg []byte
			err error
		)
		for {
			if mt, msg, err = c.ReadMessage(); err != nil {
				log.Println("Failed read to ws.", err)
				break
			}
			if string(msg) == "wantSync" {
				if err = c.WriteMessage(mt, util.Grab(json.Marshal(WSPacket{
					Type: "sync",
					Data: string(util.Grab(json.Marshal(queue.Items))),
				}))); err != nil {
					log.Println("Failed write to ws.", err)
					break
				}
			}
		}
	}))
}
