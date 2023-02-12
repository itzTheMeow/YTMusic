package main

type AccountPermissions struct {
	Owner        bool `json:"owner"`
	ArtistAdd    bool `json:"artistAdd"`
	ArtistRemove bool `json:"artistRemove"`
	SongDownload bool `json:"songDownload"`
	SongRemove   bool `json:"songRemove"`
}
type Account struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	password    string
	Token       string             `json:"authToken"`
	Permissions AccountPermissions `json:"permissions"`
}
