package thecluster

type Workspace interface {
	Fs() Fs
}

type workspace struct{ fs Fs }

// Fs implements thecluster.Workspace.
func (w *workspace) Fs() Fs { return w.fs }

var _ Workspace = &workspace{}

func NewWorkspace(fs Fs) Workspace {
	return &workspace{fs}
}
