package workspace

import (
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func IterFs(workspace thecluster.Workspace, root string) fs.Seq {
	return fs.Iter(workspace.Fs(), root)
}

func IterFiles(workspace thecluster.Workspace, root string) fs.Seq {
	return fs.IterFiles(workspace.Fs(), root)
}

func IterDirs(workspace thecluster.Workspace, root string) fs.Seq {
	return fs.IterDirs(workspace.Fs(), root)
}
