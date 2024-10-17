package testing

import (
	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type App struct {
	MockDependencies      iter.Seq[thecluster.Dependency]
	MockDependenciesError error
	MockFs                thecluster.Fs
	MockName              string
	MockPath              string
}

// Dependencies implements thecluster.App.
func (a *App) Dependencies() (iter.Seq[thecluster.Dependency], error) {
	return a.MockDependencies, a.MockDependenciesError
}

// Fs implements thecluster.App.
func (a *App) Fs() thecluster.Fs {
	return a.MockFs
}

// Name implements thecluster.App.
func (a *App) Name() string {
	return a.MockName
}

// Path implements thecluster.App.
func (a *App) Path() string {
	return a.MockPath
}

var _ thecluster.App = &App{}
