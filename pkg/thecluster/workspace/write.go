package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type writable struct {
	Workspace  thecluster.Workspace
	Base       thecluster.Fs
	Layer      thecluster.Fs
	Projection thecluster.Fs
}

// Fs implements thecluster.Workspace.
func (w *writable) Fs() thecluster.Fs {
	return w.Projection
}

var _ thecluster.Workspace = &writable{}

func Writable(ws thecluster.Workspace) *writable {
	if ws == nil {
		return nil
	}

	if w, ok := ws.(*writable); ok {
		return w
	}

	base, layer := ws.Fs(), afero.NewMemMapFs()
	fs := afero.NewCopyOnWriteFs(base, layer)

	return &writable{ws, base, layer, fs}
}
