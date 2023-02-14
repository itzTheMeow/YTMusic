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

const (
	ArtistIsAbsent ArtistStatus = iota
	ArtistIsQueued
	ArtistIsPresent
)

type Artist struct {
	ID        string                      `json:"id"`
	Name      string                      `json:"name"`
	Url       string                      `json:"url"`
	Genres    []string                    `json:"genres"`
	Followers int                         `json:"followers"`
	Icon      string                      `json:"icon"`
	Providers map[MetadataProvider]string `json:"providers"`
	Status    ArtistStatus                `json:"status,omitempty"`
}
