package app

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type app struct {
	ws thecluster.Workspace
}

// Workspace implements thecluster.App.
func (a *app) Workspace() thecluster.Workspace {
	return a.ws
}

var _ thecluster.App = &app{}
