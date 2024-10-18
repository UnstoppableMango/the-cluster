package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type basePath struct {
	fs   thecluster.Fs
	path string
}

func (p *basePath) Fs() thecluster.Fs {
	return p.fs
}

func (p *basePath) Path() string {
	return p.path
}

func At(root thecluster.Fs, path string) thecluster.Workspace {
	fsys := root
	if path != "" {
		fsys = afero.NewBasePathFs(root, path)
	}

	return &basePath{fsys, path}
}
