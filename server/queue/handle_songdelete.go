package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/util"
)

func HandleSongDelete(data []byte) {
	var item QueuedSongDelete
	err := json.Unmarshal(data, &item)
	if err != nil {
		log.Println("Failed to handle SongDownload.", err)
		return
	}
	os.Remove(media.TrackPath(item.Artist, item.Album, item.Track))
	if len(util.Grab(os.ReadDir(media.AlbumPath(item.Artist, item.Album)))) == 0 {
		os.Remove(media.AlbumPath(item.Artist, item.Album))
	}
	Add(QALibraryScan, QueuedLibraryScan{
		Directory: item.Artist.Name,
	})
	log.Println(fmt.Sprintf("Deleted track %v by %v.", item.Track.Title, item.Artist.Name))
}
