package workspace

type LocalGitWorkspace struct{}

var _ Workspace = &LocalGitWorkspace{}

func NewLocalGit() (*LocalGitWorkspace, error) {
	return &LocalGitWorkspace{}, nil
}
