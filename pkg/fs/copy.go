package fs

import (
	"fmt"
	"io"
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
	if path == "/" || path == "" {
		return nil
	}

	if info.IsDir() {
		if err := dest.Mkdir(path, os.ModeDir); err != nil {
			return fmt.Errorf("dest: %w", err)
		}
	} else {
		s, err := src.Open(path)
		if err != nil {
			return fmt.Errorf("src: %w", err)
		}

		d, err := dest.Create(path)
		if err != nil {
			return fmt.Errorf("dest: %w", err)
		}

		if _, err := io.Copy(s, d); err != nil {
			return fmt.Errorf("src to dest: %w", err)
		}

		return nil
	}

	return nil
}
