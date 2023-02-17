package main

import (
	"github.com/itzTheMeow/YTMusic/types"
)

type APIErrorResponse struct {
	Error   bool   `json:"err"`
	Message string `json:"message,omitempty"`
}

type APILoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type APILoginResponse struct {
	Token string `json:"token"`
}
type APISettingsSetRequest struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type APIArtistSearchRequest struct {
	Query    string                 `json:"query"`
	Provider types.MetadataProvider `json:"provider"`
}
type APIArtistGetRequest struct {
	ID string `json:"id"`
}
type APIArtistAddRequest struct {
	ID       string                 `json:"id"`
	Provider types.MetadataProvider `json:"provider"`
}
type APIArtistRemoveRequest struct {
	ID string `json:"id"`
}

type APITrackSearchRequest struct {
	Query    string              `json:"query"`
	Provider types.SoundProvider `json:"provider"`
}
type APITrackAddRequest struct {
	Artist   string              `json:"artist"`
	Album    string              `json:"album"`
	Track    string              `json:"track"`
	Provider types.SoundProvider `json:"provider"`
	URL      string              `json:"url"`
}

type WSPacket struct {
	Type string `json:"type"`
	Data string `json:"data"`
}
