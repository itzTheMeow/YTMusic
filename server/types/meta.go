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
	LibraryLocation string `json:"libraryLocation"`
}
