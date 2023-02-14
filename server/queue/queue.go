package queue

import (
	"encoding/json"
	"log"
)

var Items []*QueueItem = make([]*QueueItem, 0)

func Add(t QueueAction, data struct{}) {
	d, err := json.Marshal(data)
	if err != nil {
		log.Println("Failed to add queue action to queue.", err)
		return
	}
	Items = append(Items, &QueueItem{
		Type: t,
		Data: d,
	})
}
