package template

import (
	"io"
	"io/fs"
	"path/filepath"
	"text/template"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type (
	File = thecluster.TemplateFile
)

type file struct {
	fs.File
	path string
}

// Name implements thecluster.TemplateFile.
func (f *file) Name() string {
	return filepath.Base(f.path)
}

// Execute implements thecluster.TemplateFile.
func (f *file) Execute(w io.Writer, state any) error {
	data, err := io.ReadAll(f)
	if err != nil {
		return err
	}

	tmpl, err := template.New("NAME").Parse(string(data))
	if err != nil {
		return err
	}

	return tmpl.Execute(w, state)
}

var _ File = &file{}

func NewFile(path string, f fs.File) File {
	return &file{
		File: f,
		path: path,
	}
}
