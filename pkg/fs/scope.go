package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Scoped interface {
	thecluster.Fs

	Path() string
	Root() thecluster.Fs
}

type scoped struct {
	thecluster.Fs

	root thecluster.Fs
	path string
}

func (s *scoped) Path() string {
	return s.path
}

func (s *scoped) Root() thecluster.Fs {
	return s.root
}

func ScopeTo(fsys thecluster.Fs, path string) Scoped {
	view := afero.NewBasePathFs(afero.FromIOFS{FS: fsys}, path)

	return &scoped{
		Fs:   view,
		root: fsys,
		path: path,
	}
}
