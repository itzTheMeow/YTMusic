package queue

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/bogem/id3v2/v2"
	"github.com/itzTheMeow/YTMusic/media"
	"github.com/itzTheMeow/YTMusic/sound"
	"github.com/itzTheMeow/YTMusic/types"
	"github.com/levigross/grequests"
	"github.com/xfrr/goffmpeg/transcoder"
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

	convertpath := *dlpath + ".ff.mp3"
	trans := new(transcoder.Transcoder)
	err = trans.Initialize(*dlpath, convertpath)
	if err != nil {
		//os.Remove(*dlpath)
		log.Println(fmt.Sprintf("Failed to init convert track %v. %v", item.Track.Title, err))
		return
	}
	err = <-trans.Run(false)
	os.Remove(*dlpath)
	if err != nil {
		log.Println(fmt.Sprintf("Failed to convert track %v. %v", item.Track.Title, err))
		return
	}

	tag, err := id3v2.Open(convertpath, id3v2.Options{Parse: true})
	if err != nil {
		log.Println(fmt.Sprintf("Failed to open file for tagging: %v, %v", item.Track.Title, err))
		os.Remove(convertpath)
		return
	}
	defer tag.Close()

	tag.SetArtist(item.Artist.Name)
	tag.SetAlbum(item.Album.Name)
	tag.SetTitle(item.Track.Title)
	tag.SetYear(fmt.Sprint(item.Album.Year))
	tag.AddTextFrame(tag.CommonID("Track number/Position in set"), tag.DefaultEncoding(), fmt.Sprintf("%v/%v", item.Track.Number, len(item.Album.Tracks)))

	cover, err := grequests.Get(item.Album.Image, nil)

	if err == nil {
		pic := id3v2.PictureFrame{
			Encoding:    id3v2.EncodingUTF8,
			MimeType:    cover.Header.Get("content-type"),
			PictureType: id3v2.PTFrontCover,
			Description: "Front Cover",
			Picture:     cover.Bytes(),
		}
		tag.AddAttachedPicture(pic)
	} else {
		log.Println(fmt.Sprintf("Failed to download cover for %v, skipping. %v", item.Track.Title, err))
	}

	err = tag.Save()
	if err != nil {
		log.Println(fmt.Sprintf("Error tagging %v. %v", item.Track.Title, err))
		os.Remove(convertpath)
		return
	}

	tp := media.TrackPath(item.Artist, item.Album, item.Track)
	os.Mkdir(media.AlbumPath(item.Artist, item.Album), os.ModePerm)
	os.Remove(tp)
	os.Rename(convertpath, tp)
	os.Remove(convertpath)

	Add(QALibraryScan, QueuedLibraryScan{
		Directory: item.Artist.Name,
	})

	log.Println(fmt.Sprintf("Done downloading in %v!", time.Now().Sub(startTime).String()))
}
