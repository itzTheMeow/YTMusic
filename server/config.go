package main

import (
	"os"
)

var Config = struct {
	port int
}{
	port: 8777,
}
var DevEnv = os.Args[1] == "--dev"
