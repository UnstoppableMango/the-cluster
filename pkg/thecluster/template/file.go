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
	tmpl *template.Template
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

	f.tmpl, err = f.tmpl.Parse(string(data))
	if err != nil {
		return err
	}

	return f.tmpl.Execute(w, state)
}

var _ File = &file{}

func NewFile(path string, f fs.File) File {
	r := &file{
		File: f,
		path: path,
	}

	r.tmpl = template.New(
		r.Name(),
	)

	return r
}
