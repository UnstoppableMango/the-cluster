package deps

import (
	"context"
	"errors"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Workspace struct {
	thecluster.Workspace
}

// Install implements thecluster.Dependency.
func (w *Workspace) Install(ctx context.Context) error {
	if w.Workspace == nil {
		return errors.New("nil workspace")
	}

	return Install(ctx, w)
}

func FromWorkspace(workspace thecluster.Workspace) *Workspace {
	return &Workspace{workspace}
}
