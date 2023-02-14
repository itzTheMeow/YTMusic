package queue

import (
	"log"
	"os"

	"github.com/itzTheMeow/YTMusic/media"
)

func HandleLibraryScan() {
	files, err := os.ReadDir(media.Location())

	if err != nil {
		log.Println("Failed to scan library.", err)
		return
	}
}
