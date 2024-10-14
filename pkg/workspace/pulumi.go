package workspace

import (
	"context"
	"fmt"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func LoadPulumi(ctx context.Context, workspace thecluster.Workspace) (auto.Workspace, error) {
	ws, err := auto.NewLocalWorkspace(ctx,
		auto.WorkDir(workspace.Path()),
	)
	if err != nil {
		return nil, fmt.Errorf("creating local workspace: %w", err)
	}

	return ws, nil
}
