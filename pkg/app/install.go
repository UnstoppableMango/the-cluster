package app

import (
	"context"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

func InstallDeps(
	ctx context.Context,
	app thecluster.App,
	options ...workspace.InstallOption,
) error {
	return workspace.InstallDeps(ctx, app.Workspace(), options...)
}
