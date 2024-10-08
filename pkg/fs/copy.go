package fs

import (
	"fmt"
	"os"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Copy(src, dest thecluster.Fs) error {
	files, err := FailFast(Iter(src, ""))
	if err != nil {
		return fmt.Errorf("iterating over src: %w", err)
	}

	for p, i := range files {
		if err := CopyFile(src, dest, p, i); err != nil {
			return err
		}
	}

	return nil
}

func CopyFile(src, dest thecluster.Fs, path string, info FileInfo) error {
	if info.IsDir() {
		if err := dest.Mkdir(path, os.ModeDir); err != nil {
			return fmt.Errorf("mkdir dest: %w", err)
		}
	} else {
		// if _, err := io.Copy()
	}

	return nil
}
