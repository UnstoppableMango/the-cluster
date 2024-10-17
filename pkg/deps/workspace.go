package deps

import (
	"context"
	"errors"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

// Will this be confusing later?
// thecluster.Workspace <- interface
// deps.Workspace       <- struct

type Workspace struct {
	thecluster.Workspace
}

// Name implements thecluster.Dependency.
func (w *Workspace) Name() string {
	return w.Workspace.Path() // TODO: Does this make sense?
}

// Install implements thecluster.Dependency.
func (w *Workspace) Install(ctx context.Context) error {
	if w.Workspace == nil {
		return errors.New("nil workspace")
	}

	return Install(ctx, w)
}

var _ thecluster.Dependency = &Workspace{}

func FromWorkspace(workspace thecluster.Workspace) *Workspace {
	return &Workspace{workspace}
}
