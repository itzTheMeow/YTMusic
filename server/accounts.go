package main

import (
	"strings"

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
	err := Database.Get("accounts", &accounts)
	if err == nil {
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
func GetAccountName(name string) *Account {
	var accounts []*Account
	err := Database.Get("accounts", &accounts)
	if err == nil {
		for _, acc := range accounts {
			if strings.ToLower(acc.Username) == strings.ToLower(name) {
				return acc
			} else {
				return nil
			}
		}
	}
	return nil
}
func SetAccount(account Account) Account {
	var accounts []*Account
	err := Database.Get("accounts", &accounts)
	if err == nil {
		for i, acc := range accounts {
			if acc.ID == account.ID {
				accounts[i] = &account
				Database.Put("accounts", &accounts)
				return account
			}
		}
		accounts = append(accounts, &account)
		Database.Put("accounts", &accounts)
	} else {
		accounts = []*Account{&account}
		Database.Put("accounts", &accounts)
	}
	return account
}
func CreateAccount(username string, password string) Account {
	hashed := HashPassword(password)

	return SetAccount(Account{
		ID:       ulid.Make().String(),
		Username: username,
		Password: hashed,
		Token:    strings.ToLower(ulid.Make().String()),
		Permissions: AccountPermissions{
			ArtistAdd:    false,
			ArtistRemove: false,
			Owner:        false,
			SongDownload: false,
			SongRemove:   false,
		},
	})
}
