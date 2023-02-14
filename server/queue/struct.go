package queue

import "github.com/itzTheMeow/YTMusic/types"

type QueueAction int

const (
	QALibraryScan QueueAction = iota
	QAArtistAdd
)

type QueueItem struct {
	Type QueueAction `json:"type"`
	Data []byte      `json:"data"`
}

type QueuedLibraryScan struct{}

type QueuedArtistAdd struct {
	ID       string                 `json:"id"`
	Provider types.MetadataProvider `json:"provider"`
}
