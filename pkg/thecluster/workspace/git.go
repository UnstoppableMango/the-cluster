package workspace

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type LocalGitWorkspace struct{}

// Fs implements Workspace.
func (l *LocalGitWorkspace) Fs() (thecluster.Fs, error) {
	panic("unimplemented")
}

var _ Workspace = &LocalGitWorkspace{}

func NewLocalGit() (*LocalGitWorkspace, error) {
	return &LocalGitWorkspace{}, nil
}
