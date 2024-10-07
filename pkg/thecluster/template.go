package thecluster

import "github.com/unstoppablemango/the-cluster/internal/iter"

type Template interface{}

type TemplateGroup interface {
	Name() string
	Templates() iter.Seq[Template]
}
