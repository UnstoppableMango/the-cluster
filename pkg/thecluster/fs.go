package thecluster

import (
	"io/fs"

	"github.com/spf13/afero"
)

type Fs interface{ fs.FS }

type WritableFs interface {
	afero.Fs
}
