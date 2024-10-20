package fs

import (
	"errors"
	"io/fs"

	"github.com/spf13/afero"
	"github.com/unmango/go/iter"
	"github.com/unmango/go/iter/seqs"
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

		if err := afero.Walk(f, root, walker); err != nil {
			if !errors.Is(err, ErrYield) {
				_ = yield("", nil, err)
			}
		}
	}
}

func IterDirs(f thecluster.Fs, root string) Seq {
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

func IterFiles(f thecluster.Fs, root string) Seq {
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
