package app

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

func Fs(app thecluster.App) thecluster.Fs {
	return app.Workspace().Fs()
}
