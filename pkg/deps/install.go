package deps

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/unstoppablemango/the-cluster/internal/npm"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Install(ctx context.Context, ws thecluster.Workspace, options ...thecluster.InstallOption) error {
	isNpm, err := IsNpm(ws)
	if err != nil {
		return fmt.Errorf("checking package manager: %w", err)
	}
	if !isNpm {
		return errors.New("not an npm workspace")
	}

	return npm.Ci(ctx,
		npm.WithWorkingDirectory(ws.Path()),
		npm.WithStdout(os.Stdout),
		npm.WithStderr(os.Stderr),
	)
}
