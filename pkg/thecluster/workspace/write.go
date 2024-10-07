package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Writer func(thecluster.Workspace) error

func (write Writer) write(workspace thecluster.Workspace) error {
	return write(workspace)
}

type Writable interface {
	thecluster.Workspace

	Changes() thecluster.Fs
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

// Changes implements Writable.
func (w *writable) Changes() thecluster.Fs {
	return w.layer
}

// Fs implements thecluster.Workspace.
func (w *writable) Fs() thecluster.Fs {
	return w.proj
}

var _ Writable = &writable{}

func Edit(workspace thecluster.Workspace) Writable {
	if workspace == nil {
		return nil
	}

	if w, ok := workspace.(*writable); ok {
		return w
	}

	base, layer := workspace.Fs(), afero.NewMemMapFs()
	fs := afero.NewCopyOnWriteFs(base, layer)

	return &writable{base, layer, fs}
}

func Write(workspace thecluster.Workspace, writers ...Writer) (Writable, error) {
	writable := Edit(workspace)

	for _, writer := range writers {
		if err := writer.write(writable); err != nil {
			return nil, err
		}
	}

	return writable, nil
}
