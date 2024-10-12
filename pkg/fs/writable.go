package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Writable struct{ afero.Fs }

func Edit(fsys thecluster.Fs) thecluster.WritableFs {
	if writable, ok := fsys.(thecluster.WritableFs); ok {
		return writable
	}

	readonly := afero.FromIOFS{fsys}
	writable := afero.NewCopyOnWriteFs(readonly, nil)

	panic("unimplemented")
}
