package util

import (
	"fmt"
	"log"
	"os"
	"path"

	"github.com/itzTheMeow/YTMusic/types"
	"gopkg.in/yaml.v3"
)

var Config = struct {
	Port               int
	BasePath           string
	AllowUsernameChars string
	DisableFSChars     string
	YAML               string
}{
	Port:               8777,
	AllowUsernameChars: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-1234567890`,
	DisableFSChars:     `<>:"/\\|?*`,
	YAML:               path.Join(Grab(os.Getwd()), "config.yaml"),
}
var DevEnv = len(os.Args) > 1 && os.Args[1] == "--dev"

var UserConfig types.Settings

func InitConfig() {
	if DevEnv {
		Config.BasePath = path.Join(Grab(os.Getwd()), "../out")
	} else {
		Config.BasePath, _ = os.Getwd()
	}

	yamlfile, err := os.ReadFile(Config.YAML)
	if err != nil {
		fmt.Println("Failed to read YAML config.\n", err)
	} else {
		yaml.Unmarshal(yamlfile, &UserConfig)
		WriteConfig()
	}
}
func WriteConfig() {
	data, err := yaml.Marshal(UserConfig)
	if err != nil {
		log.Println("Failed to write config file. ", err)
	} else {
		os.WriteFile(Config.YAML, data, os.ModePerm)
	}
}
