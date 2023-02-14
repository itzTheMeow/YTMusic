package util

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"

	"gopkg.in/yaml.v3"
)

var Config = struct {
	Port     int
	BasePath string
}{
	Port: 8777,
}
var DevEnv = os.Args[1] == "--dev"

var UserConfig struct {
	SpotifyClientID     string `yaml:"spotify-id"`
	SpotifyClientSecret string `yaml:"spotify-secret"`
}

func InitConfig() {
	if DevEnv {
		Config.BasePath = path.Join(Grab(os.Getwd()), "../out")
	} else {
		Config.BasePath, _ = os.Getwd()
	}

	yamlfile, err := ioutil.ReadFile(path.Join(Grab(os.Getwd()), "config.yaml"))
	if err != nil {
		fmt.Println("Failed to read YAML config.\n", err)
	} else {
		yaml.Unmarshal(yamlfile, &UserConfig)
	}
}
