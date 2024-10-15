package pulumi

import (
	"context"
	"fmt"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func LoadWorkspace(ctx context.Context, workspace thecluster.Workspace) (auto.Workspace, error) {
	log := log.FromContext(ctx)
	log.Info("loading pulumi workspace", "path", workspace.Path())
	ws, err := auto.NewLocalWorkspace(ctx,
		auto.WorkDir(workspace.Path()),
	)
	if err != nil {
		return nil, fmt.Errorf("creating local workspace: %w", err)
	}

	return ws, nil
}
