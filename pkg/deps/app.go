package deps

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type App struct{ *Workspace }

func FromApp(app thecluster.App) *App {
	return &App{FromWorkspace(app)}
}
