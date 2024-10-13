package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Writer interface {
	Write(thecluster.Fs) error
}

func Edit(fsys thecluster.Fs) Writer {
	if writable, ok := fsys.(Writer); ok {
		return writable
	}

	return afero.NewCopyOnWriteFs(fsys, nil)
}

func With(fs thecluster.Fs, writers ...Writer) (thecluster.Fs, error) {

}
