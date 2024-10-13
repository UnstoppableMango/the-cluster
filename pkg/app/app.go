package app

import (
	"errors"
	"fmt"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var (
	ErrNotFound = errors.New("app dir not found")
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
	exists, err := afero.DirExists(fsys, path)
	if err != nil {
		return nil, fmt.Errorf("app dir exists: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, path)
	}

	return &app{}, nil
}
