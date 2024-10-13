package workspace

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type plain struct {
	fs thecluster.Fs
}

func (p *plain) Fs() thecluster.Fs {
	return p.fs
}

func At(fsys thecluster.Fs) thecluster.Workspace {
	return &plain{fsys}
}
