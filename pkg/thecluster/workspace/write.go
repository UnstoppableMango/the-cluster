package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
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
	base  thecluster.Fs
	layer thecluster.Fs
	proj  thecluster.Fs
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
	return w.proj
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
	projection := afero.NewCopyOnWriteFs(base, layer)

	return &writable{base, layer, projection}
}

// With applys all writes to workspace in the order
// provided, short-circuiting when an error occurs
func With(workspace Writable, writers ...Writer) (Writable, error) {
	for _, writer := range writers {
		if err := writer.write(workspace); err != nil {
			return nil, err
		}
	}

	return workspace, nil
}

func Write(workspace Writable, tracker ChangeTracker) error {
	return fs.Copy(tracker.Changes(), workspace.Fs())
}
