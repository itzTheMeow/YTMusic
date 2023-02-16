package queue

import "github.com/itzTheMeow/YTMusic/types"

type QueueAction int

const (
	QALibraryScan QueueAction = iota
	QAArtistAdd
	QASongDownload
)

type QueueItem struct {
	ID   string      `json:"id"`
	Type QueueAction `json:"type"`
	Data []byte      `json:"data"`
}

type QueuedLibraryScan struct {
	Directory string `json:"dir"`
}
type QueuedArtistAdd struct {
	ID       string                 `json:"id"`
	Provider types.MetadataProvider `json:"provider"`
}
type QueuedSongDownload struct {
	Artist   types.Artist        `json:"artist"`
	Album    types.Album         `json:"album"`
	Track    types.Track         `json:"track"`
	Provider types.SoundProvider `json:"provider"`
	URL      string              `json:"url"`
}
