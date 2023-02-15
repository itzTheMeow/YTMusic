package queue

import (
	"encoding/json"
	"log"
	"os"
	"path"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/types"
)

func HandleArtistAdd(data []byte) {
	var item QueuedArtistAdd
	err := json.Unmarshal(data, &item)
	if err != nil {
		log.Println("Failed to handle ArtistAdd.", err)
		return
	}
	var artist *types.Artist

	log.Printf("Fetching new artist %v from %v.", item.ID, item.Provider)
	switch item.Provider {
	case types.MetaProviderSpotify:
		artist, err = metadata.FetchSpotifyArtist(item.ID)
	}
	if err != nil {
		log.Printf("Failed to fetch %v artist by ID %v. %v", item.Provider, item.ID, err)
		return
	}

	artistJSON, err := json.Marshal(artist)

	if err != nil {
		log.Printf("Failed to fetch %v artist by ID %v. %v", item.Provider, item.ID, err)
	}

	os.Mkdir(media.ArtistPath(*artist), os.ModePerm)
	os.WriteFile(path.Join(media.ArtistPath(*artist), "artist.json"), artistJSON, os.ModePerm)
	log.Printf("Added new artist %v.", artist.Name)
}
