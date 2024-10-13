package app

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var (
	ErrNotFound      = errors.New("app dir not found")
	ErrNotSuppported = errors.New("not supported")
)

type app struct {
	name   string
	ws     thecluster.Workspace
	pulumi auto.Workspace
}

// Name implements thecluster.App.
func (a *app) Name() string {
	return a.name
}

// Workspace implements thecluster.App.
func (a *app) Workspace() thecluster.Workspace {
	return a.ws
}

func Load(ctx context.Context, fsys thecluster.Fs, path string) (thecluster.App, error) {
	if filepath.IsAbs(path) {
		// Why must I be an ugly duckling
		return nil, fmt.Errorf("absolute path: %w", ErrNotSuppported)
	}
	if l := len(strings.Split(path, "/")); l != 1 {
		return nil, fmt.Errorf("path segments: %d: %w", l, ErrNotSuppported)
	}

	exists, err := afero.DirExists(fsys, path)
	if err != nil {
		return nil, fmt.Errorf("app dir exists: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, path)
	}

	ws, err := auto.NewLocalWorkspace(ctx, auto.WorkDir(path))
	if err != nil {
		return nil, fmt.Errorf("creating local workspace: %w", err)
	}

	return &app{
		name:   path,
		pulumi: ws,
		ws: workspace.At(
			afero.NewBasePathFs(fsys, path),
		),
	}, nil
}
