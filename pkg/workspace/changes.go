package workspace

import (
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type ChangeTracker interface {
	Changes() thecluster.Fs
}

func Persist(tracker ChangeTracker, target thecluster.Fs) error {
	return fs.Copy(tracker.Changes(), target)
}
