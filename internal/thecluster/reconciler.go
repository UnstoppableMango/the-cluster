package thecluster

import (
	"context"
	"io"
	"path"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optup"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type Reconciler struct {
	Config Config
	Stdout io.Writer
	Stderr io.Writer
}

func (r Reconciler) Reconcile(ctx context.Context, req *tc.ReconcileRequest) (*tc.ReconcileResponse, error) {
	log := log.FromContext(ctx)
	root := r.Config.Root

	ws, err := r.LoadWorkspace(ctx, req.Component)
	if err != nil {
		log.Error("failed loading workspace")
		return nil, err
	}

	err = ws.Install(ctx, &auto.InstallOptions{
		NoPlugins: true,
		Stdout:    r.Stdout,
		Stderr:    r.Stderr,
	})
	if err != nil {
		log.Error("failed pulumi install")
		return nil, err
	}

	s, err := auto.SelectStack(ctx, req.Stack, ws)
	if err != nil {
		log.Error("failed selecting stack")
		return nil, err
	}

	_, err = s.Up(ctx,
		optup.ProgressStreams(r.Stdout),
		optup.ErrorProgressStreams(r.Stderr),
		optup.Refresh(),
	)
	if err != nil {
		log.Error("failed component preview")
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
