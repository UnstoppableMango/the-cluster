package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Writer func(Writable) error

func (write Writer) write(workspace Writable) error {
	return write(workspace)
}

type Writable interface {
	thecluster.Workspace
	ChangeTracker

	Base() thecluster.Fs
}

type writable struct {
	path  string
	base  thecluster.Fs
	layer thecluster.Fs
	view  thecluster.Fs
}

// Base implements Writable.
func (w *writable) Base() thecluster.Fs {
	return w.base
}

// Changes implements ChangeTracker.
func (w *writable) Changes() thecluster.Fs {
	return w.layer
}

// Fs implements thecluster.Workspace.
func (w *writable) Fs() thecluster.Fs {
	return w.view
}

// Path implements thecluster.Workspace.
func (l *writable) Path() string {
	panic("unimplemented")
}

var _ Writable = &writable{}

// Edit returns a read-write layer on top of workspace.
// If workspace is Writable, it is returned directly
func Edit(workspace thecluster.Workspace) Writable {
	if workspace == nil {
		// TODO: Empty workspace?
		return nil
	}

	if w, ok := workspace.(Writable); ok {
		return w
	}

	base, layer := workspace.Fs(), afero.NewMemMapFs()
	view := afero.NewCopyOnWriteFs(base, layer)

	return &writable{
		path:  workspace.Path(),
		base:  base,
		layer: layer,
		view:  view,
	}
}

// With returns a read-write layer on top of workspace
// containing all of the modifications made by writers
// in the order provided
func With(workspace thecluster.Workspace, writers ...Writer) (Writable, error) {
	w := Edit(workspace)

	for _, writer := range writers {
		if err := writer.write(w); err != nil {
			return nil, err
		}
	}

	return w, nil
}
