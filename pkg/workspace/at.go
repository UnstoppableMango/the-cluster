package workspace

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

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

func At(fsys thecluster.Fs, path string) thecluster.Workspace {
	return &plain{fsys, path}
}
