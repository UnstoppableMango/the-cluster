package workspace

import (
	"errors"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Root(workspace thecluster.Workspace) (string, error) {
	root, err := GitRoot(workspace)
	if err == nil {
		return root, nil
	} else {
		log.Debug("repo was not a git source")
	}

	return "", errors.New("unable to locate workspace root")
}

func PathTo(workspace thecluster.Workspace, elem ...string) (string, error) {
	root, err := Root(workspace)
	if err != nil {
		log.Error("unable to locate workspace root")
		return "", err
	}

	segments := append([]string{root}, elem...)
	return filepath.Join(segments...), nil
}
