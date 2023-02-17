package util

import (
	"fmt"
	"os"
	"path"

	"github.com/itzTheMeow/YTMusic/types"
	"gopkg.in/yaml.v3"
)

var Config = struct {
	Port           int
	BasePath       string
	DisableFSChars string
}{
	Port:           8777,
	DisableFSChars: `<>:"/\\|?*`,
}
var DevEnv = len(os.Args) > 1 && os.Args[1] == "--dev"

var UserConfig types.Settings

func InitConfig() {
	if DevEnv {
		Config.BasePath = path.Join(Grab(os.Getwd()), "../out")
	} else {
		Config.BasePath, _ = os.Getwd()
	}

	yamlfile, err := os.ReadFile(path.Join(Grab(os.Getwd()), "config.yaml"))
	if err != nil {
		fmt.Println("Failed to read YAML config.\n", err)
	} else {
		yaml.Unmarshal(yamlfile, &UserConfig)
	}
}
