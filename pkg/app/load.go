package app

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

func Load(ctx context.Context, root thecluster.Fs, path string) (thecluster.App, error) {
	log.FromContext(ctx).Info("loading app", "path", path)
	if filepath.IsAbs(path) {
		// Why must I be an ugly duckling
		return nil, fmt.Errorf("absolute path: %w", ErrNotSuppported)
	}

	name, appPath := path, filepath.Join(CanonicalDir, path)
	if parts := strings.Split(filepath.Clean(path), "/"); len(parts) != 1 {
		if parts[0] != "apps" || len(parts) != 2 {
			return nil, fmt.Errorf("path segments: %d: %w", len(parts), ErrNotSuppported)
		} else {
			name, appPath = parts[1], path
		}
	}

	exists, err := afero.DirExists(root, appPath)
	if err != nil {
		return nil, fmt.Errorf("app dir exists: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, appPath)
	}

	return &app{
		name: name,
		root: root,
		Workspace: workspace.At(
			afero.NewBasePathFs(root, appPath),
			appPath,
		),
	}, nil
}
