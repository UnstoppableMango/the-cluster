package fs

import (
	"path/filepath"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type WalkFunc = filepath.WalkFunc

func Walk(fsys thecluster.Fs, root string, walker WalkFunc) error {
	return afero.Walk(afero.FromIOFS{FS: fsys}, root, walker)
}
