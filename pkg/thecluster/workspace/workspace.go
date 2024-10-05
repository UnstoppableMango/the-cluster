package workspace

import (
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var (
	New = thecluster.NewWorkspace
)

func ReadOnly() thecluster.Workspace {
	return New(fs.ReadOnly())
}
