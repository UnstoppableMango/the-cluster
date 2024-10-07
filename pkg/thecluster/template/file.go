package template

import (
	"path/filepath"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type (
	File = thecluster.TemplateFile
)

type file struct {
	path string
}

// Name implements thecluster.TemplateFile.
func (f *file) Name() string {
	return filepath.Base(f.path)
}

var _ File = &file{}

func NewFile(path string) File {
	f := &file{
		path: path,
	}

	return f
}
