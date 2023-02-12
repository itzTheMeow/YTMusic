package main

type APIRequestBase struct {
	Authorization string `json:"auth"`
}

type APIErrorResponse struct {
	Error   bool   `json:"err"`
	Message string `json:"message"`
}

type APILoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
