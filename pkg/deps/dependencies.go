package deps

import "github.com/unmango/go/iter"

type Dependency interface{}

type Dependant interface {
	Dependencies() iter.Seq[Dependency]
}
