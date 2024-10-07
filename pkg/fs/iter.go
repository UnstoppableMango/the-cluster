package fs

import (
	"errors"
	"io/fs"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var ErrYield = errors.New("yield returned false")

func Iter(f thecluster.Fs, root string) iter.Seq3[string, fs.FileInfo, error] {
	return func(yield func(string, fs.FileInfo, error) bool) {
		walker := func(path string, info fs.FileInfo, err error) error {
			return yieldErr(yield(path, info, err))
		}

		if err := afero.Walk(f, root, walker); err != nil {
			if !errors.Is(err, ErrYield) {
				_ = yield("", nil, err)
			}
		}
	}
}

func IterDirs(f thecluster.Fs, root string) iter.Seq3[string, fs.FileInfo, error] {
	return func(yield func(string, fs.FileInfo, error) bool) {
		walker := func(path string, info fs.FileInfo, err error) error {
			if !info.IsDir() {
				return nil
			}

			return yieldErr(yield(path, info, err))
		}

		if err := afero.Walk(f, root, walker); err != nil {
			if !errors.Is(err, ErrYield) {
				_ = yield("", nil, err)
			}
		}
	}
}

func IterFiles(f thecluster.Fs, root string) iter.Seq3[string, fs.FileInfo, error] {
	return func(yield func(string, fs.FileInfo, error) bool) {
		walker := func(path string, info fs.FileInfo, err error) error {
			if info.IsDir() {
				return nil
			}

			return yieldErr(yield(path, info, err))
		}

		if err := afero.Walk(f, root, walker); err != nil {
			if !errors.Is(err, ErrYield) {
				_ = yield("", nil, err)
			}
		}
	}
}

func yieldErr(yield bool) error {
	if yield {
		return nil
	} else {
		return ErrYield
	}
}
