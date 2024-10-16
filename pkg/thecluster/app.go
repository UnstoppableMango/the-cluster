package thecluster

type App interface {
	Workspace
	Dependent

	Name() string
}
