package fs

import (
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type ChangeTracker interface {
	Changes() thecluster.Fs
}

type changeTracker struct {
	thecluster.WritableFs
	base thecluster.Fs
}

func (t *changeTracker) Changes() thecluster.Fs {
	return t
}

func NewChangeTracker() ChangeTracker {
	return &changeTracker{}
}

func Persist(tracker ChangeTracker, target thecluster.Fs) error {
	return Copy(tracker.Changes(), target)
}
