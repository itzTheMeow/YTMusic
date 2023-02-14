package media

import (
	"strings"

	"github.com/itzTheMeow/YTMusic/util"
)

func SanitizeFileName(name string) string {
	newName := ""
	for _, c := range strings.Split(name, "") {
		if strings.Contains(util.Config.DisableFSChars, c) {
			newName += "_"
		} else {
			newName += c
		}
	}
	return newName
}
