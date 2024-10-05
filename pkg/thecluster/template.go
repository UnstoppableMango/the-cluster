package thecluster

import "iter"

type Template interface{}

type TemplateGroup interface {
	Name() string
	Templates() iter.Seq[Template]
}
