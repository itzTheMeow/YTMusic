package main

import (
	"fmt"

	"github.com/oklog/ulid/v2"
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) string {
	bytes, _ := bcrypt.GenerateFromPassword([]byte(password), 15)
	return string(bytes)
}
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GetAccount(id string) *Account {
	var accounts []*Account
	err := Database.Get(fmt.Sprintf("account_%v", id), &accounts)
	if err != nil {
		for _, acc := range accounts {
			if acc.ID == id {
				return acc
			} else {
				return nil
			}
		}
	}
	return nil
}
func SetAccount(account Account) Account {
	Database.Put(fmt.Sprintf("account_%v", account.ID), account)
	return account
}
func CreateAccount(username string, password string) Account {
	hashed := HashPassword(password)

	return SetAccount(Account{
		ID:       ulid.Make(),
		Username: username,
		password: hashed,
		Permissions: AccountPermissions{
			ArtistAdd:    false,
			ArtistRemove: false,
			Owner:        false,
			SongDownload: false,
			SongRemove:   false,
		},
	})
}
