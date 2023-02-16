package main

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/itzTheMeow/YTMusic/types"
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

func migrateAccount(account *types.Account) *types.Account {
	if account.Permissions.Owner {
		account.Permissions.ArtistAdd = true
		account.Permissions.ArtistRemove = true
		account.Permissions.ArtistRemoveSelf = true
		account.Permissions.SongDownload = true
		account.Permissions.SongRemove = true
		account.Permissions.SongRemoveSelf = true
	}
	return account
}

func GetAccount(id string) *types.Account {
	var accounts []*types.Account
	err := Database.Get("accounts", &accounts)
	if err == nil {
		for _, acc := range accounts {
			if acc.ID == id {
				return migrateAccount(acc)
			} else {
				return nil
			}
		}
	}
	return nil
}
func GetAccountName(name string) *types.Account {
	var accounts []*types.Account
	err := Database.Get("accounts", &accounts)
	if err == nil {
		for _, acc := range accounts {
			if strings.ToLower(acc.Username) == strings.ToLower(name) {
				return migrateAccount(acc)
			} else {
				return nil
			}
		}
	}
	return nil
}
func GetAuthorizedAccount(req *fiber.Ctx) *types.Account {
	var accounts []*types.Account
	err := Database.Get("accounts", &accounts)
	if err == nil {
		for _, acc := range accounts {
			if acc.Token == req.Get("Authorization") {
				return migrateAccount(acc)
			}
		}
	}
	return nil
}
func SetAccount(account types.Account) types.Account {
	var accounts []*types.Account
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
		accounts = []*types.Account{&account}
		Database.Put("accounts", &accounts)
	}
	return account
}
func CreateAccount(username string, password string) types.Account {
	hashed := HashPassword(password)

	return SetAccount(types.Account{
		ID:       ulid.Make().String(),
		Username: username,
		Password: hashed,
		Token:    strings.ToLower(ulid.Make().String()),
		Permissions: types.AccountPermissions{
			ArtistAdd:    false,
			ArtistRemove: false,
			Owner:        false,
			SongDownload: false,
			SongRemove:   false,
		},
	})
}
