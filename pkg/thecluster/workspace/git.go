package workspace

import (
	"fmt"

	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type LocalGitWorkspace struct {
	fs *fs.LocalRepoFs
}

// Fs implements Workspace.
func (l *LocalGitWorkspace) Fs() thecluster.Fs {
	return l.fs
}

var _ thecluster.Workspace = &LocalGitWorkspace{}

func NewLocalGit() (*LocalGitWorkspace, error) {
	fs, err := fs.LocalRepo()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve fs: %w", err)
	}

	return &LocalGitWorkspace{fs}, nil
}

func GitRoot(workspace thecluster.Workspace) (string, error) {
	return fs.GitRoot(workspace.Fs())
}
