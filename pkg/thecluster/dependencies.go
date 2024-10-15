package thecluster

import (
	"github.com/unmango/go/iter"
)

type Dependency interface {
	Workspace() Workspace
}

type Dependent interface {
	Dependencies() iter.Seq[Dependency]
}
