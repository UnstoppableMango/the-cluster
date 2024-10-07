package thecluster

import "github.com/unstoppablemango/the-cluster/internal/iter"

type TemplateFile interface {
	Name() string
}

type Template interface {
	Name() string
	Files() iter.Seq[TemplateFile]
}

type TemplateGroup interface {
	Name() string
	Templates() (iter.Seq[Template], error)
}
