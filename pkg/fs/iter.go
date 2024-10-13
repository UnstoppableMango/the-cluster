package fs

import (
	"errors"
	"io/fs"

	"github.com/unmango/go/iter"
	"github.com/unmango/go/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Seq = iter.Seq3[string, fs.FileInfo, error]

var (
	ErrYield = errors.New("yield returned false")
	FailFast = seqs.FailFast2[string, fs.FileInfo, error]
)

func Iter(f thecluster.Fs, root string) Seq {
	return func(yield func(string, fs.FileInfo, error) bool) {
		walker := func(path string, info fs.FileInfo, err error) error {
			return yieldErr(yield(path, info, err))
		}

		if err := Walk(f, root, walker); err != nil {
			if !errors.Is(err, ErrYield) {
				_ = yield("", nil, err)
			}
		}
	}
}

func IterDirs(f thecluster.Fs, root string) Seq {
	return func(yield func(string, fs.FileInfo, error) bool) {
		Iter(f, root)(func(path string, info fs.FileInfo, err error) bool {
			isDir := info.IsDir()
			if isDir {
				yield(path, info, err)
			}

			return isDir
		})
	}
}

func IterFiles(f thecluster.Fs, root string) Seq {
	return func(yield func(string, fs.FileInfo, error) bool) {
		Iter(f, root)(func(path string, info fs.FileInfo, err error) bool {
			isFile := !info.IsDir()
			if isFile {
				yield(path, info, err)
			}

			return isFile
		})
	}
}

func yieldErr(yield bool) error {
	if yield {
		return nil
	} else {
		return ErrYield
	}
}
