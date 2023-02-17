package sound

import (
	"context"
	"io"
	"os"
	"os/exec"
)

// partially taken from https://github.com/wader/goutubedl/blob/master/goutubedl.go#L420
func DownloadURL(url string) (io.Reader, error) {
	cmd := exec.CommandContext(context.Background(), "yt-dlp", url, "-o", "-")

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
