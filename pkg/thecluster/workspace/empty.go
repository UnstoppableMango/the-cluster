package workspace

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Empty() thecluster.Workspace {
	return thecluster.NewWorkspace(afero.NewMemMapFs())
}
