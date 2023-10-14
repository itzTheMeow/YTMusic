package sound

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/itzTheMeow/YTMusic/util"
)

// partially taken from https://github.com/wader/goutubedl/blob/master/goutubedl.go#L420
func DownloadURL(url string) (io.Reader, error) {
	args := make([]string, 0)
	for _, arg := range util.UserConfig.YTDLCommand {
		args = append(args, fmt.Sprintf(arg, url))
	}

	cmd := exec.CommandContext(context.Background(), args[0], args[1:]...)

	reader, w := io.Pipe()
	cmd.Stderr = os.Stderr
	cmd.Stdout = w

	if err := cmd.Start(); err != nil {
		return nil, err
	}

	go func() {
		cmd.Wait()
		w.Close()
	}()

	return reader, nil
}
