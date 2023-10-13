package types

// Docs in src/utils.ts
type AccountPermissions struct {
	Owner            bool `json:"owner"`
	ArtistAdd        bool `json:"artistAdd"`
	ArtistRemove     bool `json:"artistRemove"`
	ArtistRemoveSelf bool `json:"artistRemoveSelf"`
	SongDownload     bool `json:"songDownload"`
	SongRemove       bool `json:"songRemove"`
	SongRemoveSelf   bool `json:"songRemoveSelf"`
}
type Account struct {
	ID          string             `json:"id"`
	Username    string             `json:"username"`
	Password    string             `json:"-"`
	Token       string             `json:"authToken"`
	Permissions AccountPermissions `json:"permissions"`
}

type Settings struct {
	LibraryFolder       string `yaml:"library-folder" json:"libraryFolder"`
	SpotifyClientID     string `yaml:"spotify-id" json:"spotifyID"`
	SpotifyClientSecret string `yaml:"spotify-secret" json:"spotifySecret"`
	PipedAPI            string `yaml:"piped-api" json:"pipedAPI"`
	YTDLCommand         string `yaml:"ytdl-command" json:"ytdlCommand"`
}
