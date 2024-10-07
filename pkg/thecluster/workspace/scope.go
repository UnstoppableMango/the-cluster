package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Scoped interface {
	thecluster.Workspace

	Path() string
	Root() thecluster.Workspace
}

type scoped struct {
	view thecluster.Fs
	root thecluster.Workspace
	path string
}

// Fs implements thecluster.Workspace.
func (s *scoped) Fs() thecluster.Fs {
	return s.view
}

func (s *scoped) Path() string {
	return s.path
}

func (s *scoped) Root() thecluster.Workspace {
	return s.root
}

func ScopeTo(workspace thecluster.Workspace, path string) Scoped {
	view := afero.NewBasePathFs(workspace.Fs(), path)

	return &scoped{
		root: workspace,
		path: path,
		view: view,
	}
}
