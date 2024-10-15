package app

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/spf13/afero"
	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

const (
	StandardDir = "apps"
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

// Dependencies implements thecluster.App.
func (a *app) Dependencies() iter.Seq[thecluster.Dependency] {
	panic("unimplemented")
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
	log.FromContext(ctx).Info("loading app", "path", path)
	if filepath.IsAbs(path) {
		// Why must I be an ugly duckling
		return nil, fmt.Errorf("absolute path: %w", ErrNotSuppported)
	}

	name, appPath := path, filepath.Join(StandardDir, path)
	if parts := strings.Split(filepath.Clean(path), "/"); len(parts) != 1 {
		if parts[0] != "apps" || len(parts) != 2 {
			return nil, fmt.Errorf("path segments: %d: %w", len(parts), ErrNotSuppported)
		} else {
			name, appPath = parts[1], path
		}
	}

	exists, err := afero.DirExists(fsys, appPath)
	if err != nil {
		return nil, fmt.Errorf("app dir exists: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, appPath)
	}

	return &app{
		name: name,
		ws: workspace.At(
			afero.NewBasePathFs(fsys, appPath),
			appPath,
		),
	}, nil
}
