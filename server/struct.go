package main

type AccountPermissions struct {
	Owner        bool `json:"owner"`
	ArtistAdd    bool `json:"artistAdd"`
	ArtistRemove bool `json:"artistRemove"`
	SongDownload bool `json:"songDownload"`
	SongRemove   bool `json:"songRemove"`
}
type Account struct {
	ID          string             `json:"id"`
	Username    string             `json:"username"`
	Password    string             `json:"-"`
	Token       string             `json:"authToken"`
	Permissions AccountPermissions `json:"permissions"`
}

type Settings struct {
	LibraryLocation string `json:"libraryLocation"`
}

type MetadataProvider int
type SoundProvider int

const (
	MetaProviderSpotify MetadataProvider = iota
	MetaProviderSoundCloud
	MetaProviderKonami
	MetaProviderBandLab
)
const (
	SoundProviderYouTube SoundProvider = iota
	SoundProviderSoundCloud
)

type ArtistStatus int
type AlbumType string

const (
	ArtistIsAbsent ArtistStatus = iota
	ArtistIsQueued
	ArtistIsPresent
)
const (
	AlbumTypeAlbum  AlbumType = "album"
	AlbumTypeSingle AlbumType = "single"
)

type Artist struct {
	// Artist
	ID        string                      `json:"id"`
	Name      string                      `json:"name"`
	Url       string                      `json:"url"`
	Genres    []string                    `json:"genres"`
	Followers int                         `json:"followers"`
	Icon      string                      `json:"icon"`
	Providers map[MetadataProvider]string `json:"providers"`
	Status    ArtistStatus                `json:"status,omitempty"`
	// Extended Artist
	Albums []Album `json:"albums,omitempty"`
	// Metadata
	Version int `json:"version,omitempty"`
}
type Album struct {
	Type     AlbumType        `json:"type"`
	ID       string           `json:"id"`
	Name     string           `json:"name"`
	Url      string           `json:"url"`
	Year     int              `json:"year"`
	Image    string           `json:"image"`
	Tracks   []Track          `json:"tracks"`
	UUID     string           `json:"uuid"`
	Provider MetadataProvider `json:"provider"`
}
type Track struct {
	Id       string `json:"id"`
	Title    string `json:"title"`
	Url      string `json:"url"`
	Number   int    `json:"number"`
	Duration int    `json:"duration"`
	Explicit bool   `json:"explicit"`
	Added    bool   `json:"added,omitempty"`
	Uuid     string `json:"uuid"`
}

type DownloadableAuthor struct {
	Name string `json:"name"`
	Icon string `json:"icon"`
	URL  string `json:"url"`
}
type Downloadable struct {
	Title      string             `json:"title"`
	Duration   int                `json:"duration"`
	UploadedAt int                `json:"uploadedAt"`
	Views      int                `json:"views"`
	Thumbnail  string             `json:"thumbnail"`
	Author     DownloadableAuthor `json:"author"`
	URL        string             `json:"url"`
	Embed      string             `json:"embed"`
}
