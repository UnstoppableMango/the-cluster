package workspace

import (
	"context"
	"fmt"

	"github.com/unstoppablemango/the-cluster/pkg/deps"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func InstallDeps(ctx context.Context, ws thecluster.Workspace, options ...thecluster.InstallOption) error {
	if dependent, ok := ws.(thecluster.Dependent); ok {
		// TODO: Graphs
		deps, err := dependent.Dependencies()
		if err != nil {
			return fmt.Errorf("listing dependencies: %w", err)
		}

		for d := range deps {
			if err = d.Install(ctx); err != nil {
				return fmt.Errorf("installing %s: %w", d.Name(), err)
			}
		}
	}

	return deps.Install(ctx, ws, options...)
}
