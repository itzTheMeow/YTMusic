package main

type APIErrorResponse struct {
	Error   bool   `json:"err"`
	Message string `json:"message"`
}

type APILoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type APILoginResponse struct {
	Token string `json:"token"`
}
