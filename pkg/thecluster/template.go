package thecluster

import (
	"io"

	"github.com/unmango/go/iter"
)

type TemplateFile interface {
	Name() string
	Execute(io.Writer, any) error
}

type Template interface {
	Name() string
	Files() iter.Seq[TemplateFile]
}

type TemplateGroup interface {
	Name() string
	Templates() (iter.Seq[Template], error)
}
