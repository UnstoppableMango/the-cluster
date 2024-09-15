package thecluster

import (
	"context"
	"path"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type Reconciler struct {
	Config Config
}

func (r Reconciler) Reconcile(ctx context.Context, req *tc.ReconcileRequest) (*tc.ReconcileResponse, error) {
	log := log.FromContext(ctx)
	root := r.Config.Root

	_, err := r.LoadWorkspace(ctx, req.Component)
	if err != nil {
		log.Error("failed loading workspace", "err", err)
		return nil, err
	}

	return &tc.ReconcileResponse{
		Root: root,
	}, nil
}

func (r Reconciler) LoadWorkspace(ctx context.Context, component string) (auto.Workspace, error) {
	path := path.Join(r.Config.Root, component)
	return auto.NewLocalWorkspace(ctx, auto.WorkDir(path))
}
