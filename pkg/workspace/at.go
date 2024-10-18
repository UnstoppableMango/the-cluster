package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type plain struct {
	fs   thecluster.Fs
	path string
}

func (p *plain) Fs() thecluster.Fs {
	return p.fs
}

func (p *plain) Path() string {
	return p.path
}

func At(root thecluster.Fs, path string) thecluster.Workspace {
	return &plain{afero.NewBasePathFs(root, path), path}
}
