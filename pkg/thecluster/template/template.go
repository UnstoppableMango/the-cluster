package template

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type tmpl struct{}

var _ thecluster.Template = &tmpl{}

func New() thecluster.Template {
	return &tmpl{}
}
