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

type APITrackSearchRequest struct {
	Query    string              `json:"query"`
	Provider types.SoundProvider `json:"provider"`
}
