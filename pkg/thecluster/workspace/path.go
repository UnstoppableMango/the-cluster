package workspace

import (
	"context"
	"errors"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Root(ctx context.Context, workspace thecluster.Workspace) (string, error) {
	log := log.FromContext(ctx)

	root, err := GitRoot(workspace)
	if err == nil {
		return root, nil
	} else {
		log.Debug("repo was not a git source")
	}

	return "", errors.New("unable to local workspace root")
}

func PathTo(ctx context.Context, workspace thecluster.Workspace, elem ...string) (string, error) {
	log := log.FromContext(ctx)

	root, err := Root(ctx, workspace)
	if err != nil {
		log.Error("unable to locate workspace root")
		return "", err
	}

	segments := append([]string{root}, elem...)
	return filepath.Join(segments...), nil
}
