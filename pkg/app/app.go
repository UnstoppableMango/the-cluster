package app

import (
	"errors"
	"fmt"
	"path/filepath"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var (
	ErrNotFound      = errors.New("app dir not found")
	ErrNotSuppported = errors.New("not supported")
)

type app struct {
	name string
	ws   thecluster.Workspace
}

// Name implements thecluster.App.
func (a *app) Name() string {
	return a.name
}

// Workspace implements thecluster.App.
func (a *app) Workspace() thecluster.Workspace {
	return a.ws
}

func Load(fsys thecluster.Fs, path string) (thecluster.App, error) {
	if filepath.IsAbs(path) {
		// Why must I be an ugly duckling
		return nil, fmt.Errorf("absolute path: %w", ErrNotSuppported)
	}

	exists, err := afero.DirExists(fsys, path)
	if err != nil {
		return nil, fmt.Errorf("app dir exists: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, path)
	}

	return &app{
		name: path,
		ws: workspace.At(
			afero.NewBasePathFs(fsys, path),
		),
	}, nil
}
