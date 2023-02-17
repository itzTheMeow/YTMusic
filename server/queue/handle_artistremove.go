package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
)

func HandleArtistRemove(data []byte) {
	var item QueuedArtistRemove
	err := json.Unmarshal(data, &item)
	if err != nil {
		log.Println("Failed to handle ArtistRemove.", err)
		return
	}

	i := slices.IndexFunc(media.Artists, func(a types.Artist) bool {
		return a.ID == item.ID
	})
	if i == -1 {
		return
	}
	artist := media.Artists[i]
	os.RemoveAll(media.ArtistPath(artist))
	media.Artists = append(media.Artists[:i], media.Artists[i+1:]...)
	log.Println(fmt.Sprintf("Deleted artist %v.", artist.Name))
}
