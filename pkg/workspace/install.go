package workspace

import (
	"context"

	"github.com/unstoppablemango/the-cluster/pkg/deps"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func InstallDeps(ctx context.Context, ws thecluster.Workspace, options ...thecluster.InstallOption) error {
	// if dependent, ok := ws.(thecluster.Dependent); ok {
	// 	for d := range dependent.Dependencies() {
	// 		if err := InstallDeps(ctx, d.Workspace(), options...); err != nil {
	// 			return fmt.Errorf("installing dependency at %s: %w", d.Workspace().Path(), err)
	// 		}
	// 	}
	// }

	return deps.Install(ctx, ws, options...)
}
