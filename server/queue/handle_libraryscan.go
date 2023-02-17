package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
)

func doArtist(dir string) *types.Artist {
	meta, err := os.ReadFile(path.Join(dir, "artist.json"))
	if err != nil {
		log.Println(fmt.Sprintf("Invalid artist '%v' in media folder.", path.Base(dir)))
		return nil
	}
	var artistJSON types.Artist
	err = json.Unmarshal(meta, &artistJSON)
	if err != nil {
		log.Println(fmt.Sprintf("Invalid artist JSON '%v' in media folder.", path.Base(dir)))
		return nil
	}
	for ai, alb := range artistJSON.Albums {
		files, err := os.ReadDir(media.AlbumPath(artistJSON, alb))
		if err == nil {
			for _, f := range files {
				i := slices.IndexFunc(alb.Tracks, func(track types.Track) bool {
					return f.Name() == media.TrackName(track)
				})
				if i >= 0 {
					artistJSON.Albums[ai].Tracks[i].Added = true
				}
			}
		}
	}
	return &artistJSON
}

func HandleLibraryScan(data []byte) {
	var item QueuedLibraryScan
	err := json.Unmarshal(data, &item)
	if err != nil {
		log.Println("Failed to handle LibraryScan.", err)
		return
	}
	startTime := time.Now()
	artists := make([]types.Artist, 0)

	if len(item.Directory) > 0 {
		if artist := doArtist(path.Join(media.Location(), media.SanitizeFileName(item.Directory))); artist != nil {
			if i := slices.IndexFunc(media.Artists, func(a types.Artist) bool {
				return strings.ToLower(a.Name) == strings.ToLower(artist.Name)
			}); i >= 0 {
				media.Artists[i] = *artist
			} else {
				media.Artists = append(media.Artists, *artist)
			}
		}
	} else {
		files, err := os.ReadDir(media.Location())

		if err != nil {
			log.Println("Failed to scan library.", err)
			return
		}

		for _, folder := range files {
			if folder.IsDir() {
				if artist := doArtist(path.Join(media.Location(), folder.Name())); artist != nil {
					artists = append(artists, *artist)
				}
			}
		}
		media.Artists = artists
	}

	log.Println(fmt.Sprintf("Done library scan in %v!", time.Now().Sub(startTime).String()))
}
