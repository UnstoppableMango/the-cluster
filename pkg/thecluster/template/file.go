package template

import (
	"fmt"
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
func (f *file) Execute(fs thecluster.Fs, state any) error {
	data, err := io.ReadAll(f)
	if err != nil {
		return err
	}

	f.tmpl, err = f.tmpl.Parse(string(data))
	if err != nil {
		return err
	}

	target, err := fs.Create(f.path)
	if err != nil {
		return fmt.Errorf("target: %w", err)
	}

	return f.tmpl.Execute(target, state)
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
