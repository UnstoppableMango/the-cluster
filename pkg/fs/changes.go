package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type ChangeTracker interface {
	thecluster.WritableFs
	Changes() thecluster.Fs
}

type changeTracker struct {
	thecluster.WritableFs

	base    thecluster.Fs
	changes thecluster.WritableFs
}

func (t *changeTracker) Changes() thecluster.Fs {
	return afero.NewIOFS(t.changes)
}

func NewChangeTracker(fsys thecluster.Fs) ChangeTracker {
	base := afero.FromIOFS{FS: fsys}
	changes := afero.NewMemMapFs()
	view := afero.NewCopyOnWriteFs(base, changes)

	return &changeTracker{
		WritableFs: view,
		base:       fsys,
		changes:    changes,
	}
}

func Persist(tracker ChangeTracker, target thecluster.WritableFs) error {
	return Copy(tracker.Changes(), target)
}
