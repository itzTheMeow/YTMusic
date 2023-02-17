package queue

import (
	"encoding/json"
	"log"

	"github.com/oklog/ulid/v2"
)

var Items []*QueueItem = make([]*QueueItem, 0)

func Add(t QueueAction, data any) {
	d, err := json.Marshal(data)
	if err != nil {
		log.Println("Failed to add queue action to queue.", err)
		return
	}
	Items = append(Items, &QueueItem{
		ID:   ulid.Make().String(),
		Type: t,
		Data: d,
	})
	go Run()
}

type QueueUpdater func(add bool, i *QueueItem)

var Updaters []QueueUpdater

func OnUpdate(fn QueueUpdater) {
	Updaters = append(Updaters, fn)
}

var Running = false

func Run() {
	if Running || len(Items) == 0 {
		return
	}

	Running = true
	item := Items[0]
	Items = Items[1:]

	switch item.Type {
	case QAArtistAdd:
		HandleArtistAdd(item.Data)
	case QALibraryScan:
		HandleLibraryScan(item.Data)
	case QASongDownload:
		HandleSongDownload(item.Data)
	}

	Running = false
	for _, upd := range Updaters {
		upd(false, item)
	}
	if len(Items) > 0 {
		Run()
	}
}
