package main

import (
	"github.com/gofiber/adaptor/v2"
	"github.com/itzTheMeow/YTMusic/queue"
	"github.com/zishang520/socket.io/socket"
)

func InitAPIWS() {
	io := socket.NewServer(nil, nil)
	App.Use("/socket.io", adaptor.HTTPHandler(io.ServeHandler(nil)))

	queue.OnUpdate(func(add bool, i *queue.QueueItem) {
		if add {
			io.Sockets().Emit("add", i)
		} else {
			io.Sockets().Emit("remove", i)
		}
	})

	io.On("connection", func(clients ...any) {
		socket := clients[0].(*socket.Socket)
		socket.Emit("sync", queue.Items)
		socket.On("wantSync", func(datas ...any) {
			socket.Emit("sync", queue.Items)
		})
	})
}
