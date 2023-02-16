package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/itzTheMeow/YTMusic/sound"
	"github.com/itzTheMeow/YTMusic/types"
)

func HandleSongDownload(data []byte) {
	var item QueuedSongDownload
	err := json.Unmarshal(data, &item)
	if err != nil {
		log.Println("Failed to handle SongDownload.", err)
		return
	}
	startTime := time.Now()

	var (
		dlpath *string
	)
	switch item.Provider {
	case types.SoundProviderYouTube:
		dlpath, err = sound.DownloadYouTube(item.URL)
	}
	if err != nil || dlpath == nil {
		log.Println(fmt.Sprintf("Failed to download track %v. %v", item.Track.Title, err))
		return
	}

	convertpath := dlpath + ".ff.mp3"

	log.Println(fmt.Sprintf("Done downloading in %v!", time.Now().Sub(startTime).String()))
}
