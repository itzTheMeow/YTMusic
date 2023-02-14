package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"time"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/types"
)

func HandleLibraryScan() {
	startTime := time.Now()
	artists := make([]types.Artist, 0)

	files, err := os.ReadDir(media.Location())

	if err != nil {
		log.Println("Failed to scan library.", err)
		return
	}

	for _, folder := range files {
		if !folder.IsDir() {
			continue
		}
		adir := path.Join(media.Location(), folder.Name())
		meta, err := os.ReadFile(adir)
		if err != nil {
			log.Println(fmt.Sprintf("Invalid artist '%v' in media folder.", folder.Name()))
			continue
		}
		var artistJSON types.Artist
		err = json.Unmarshal(meta, &artistJSON)
		if err != nil {
			log.Println(fmt.Sprintf("Invalid artist JSON '%v' in media folder.", folder.Name()))
			continue
		}
		artists = append(artists, artistJSON)
	}

	media.Artists = artists
	log.Println(fmt.Sprintf("Done library scan in %v!", time.Now().Sub(startTime).String()))
}
