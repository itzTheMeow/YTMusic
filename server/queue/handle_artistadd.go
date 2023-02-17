package queue

import (
	"encoding/json"
	"log"
	"os"
	"path"
	"strings"

	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/metadata"
	"github.com/itzTheMeow/YTMusic/types"
	"golang.org/x/exp/slices"
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
	case types.MetaProviderSoundCloud:
		artist, err = metadata.FetchSoundCloudArtist(item.ID)
	}
	if err != nil {
		log.Printf("Failed to fetch %v artist by ID %v. %v", item.Provider, item.ID, err)
		return
	}

	existingI := slices.IndexFunc(media.Artists, func(a types.Artist) bool {
		return strings.ToLower(a.Name) == strings.ToLower(artist.Name)
	})
	if existingI >= 0 {
		existing := media.Artists[existingI]
		artist.ID = existing.ID
		for _, alb := range existing.Albums {
			if i := slices.IndexFunc(artist.Albums, func(a types.Album) bool {
				return strings.ToLower(a.Name) == strings.ToLower(alb.Name)
			}); i >= 0 {
				artist.Albums[i] = alb
			} else {
				artist.Albums = append(artist.Albums, alb)
			}
		}
	}

	artist.Version = 2
	artistJSON, err := json.Marshal(artist)

	if err != nil {
		log.Printf("Failed to fetch %v artist by ID %v. %v", item.Provider, item.ID, err)
	}

	os.Mkdir(media.ArtistPath(*artist), os.ModePerm)
	os.WriteFile(path.Join(media.ArtistPath(*artist), "artist.json"), artistJSON, os.ModePerm)

	found := slices.IndexFunc(media.Artists, func(a types.Artist) bool {
		return strings.ToLower(a.Name) == strings.ToLower(artist.Name)
	})
	if found >= 0 {
		media.Artists[found] = *artist
	} else {
		media.Artists = append(media.Artists, *artist)
	}

	Add(QALibraryScan, QueuedLibraryScan{
		Directory: artist.Name,
	})

	if existingI >= 0 {
		log.Printf("Updated artist %v.", artist.Name)
	} else {
		log.Printf("Added new artist %v.", artist.Name)
	}
}
