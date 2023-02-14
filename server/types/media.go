package types

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
