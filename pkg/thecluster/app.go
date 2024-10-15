package thecluster

type App interface {
	Dependent

	Name() string
	Workspace() Workspace
}
