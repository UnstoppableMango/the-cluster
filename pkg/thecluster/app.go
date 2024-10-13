package thecluster

type App interface {
	Name() string
	Workspace() Workspace
}
