package thecluster

type Workspace interface {
	Fs() Fs
	Path() string
}
