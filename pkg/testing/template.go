package testing

import (
	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Template struct {
	MockName  string
	MockFiles iter.Seq[thecluster.TemplateFile]
}

// Files implements thecluster.Template.
func (t *Template) Files() iter.Seq[thecluster.TemplateFile] {
	return t.MockFiles
}

// Name implements thecluster.Template.
func (t *Template) Name() string {
	return t.MockName
}

var _ thecluster.Template = &Template{}
