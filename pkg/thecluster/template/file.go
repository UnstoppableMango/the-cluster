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

type Opener func() (io.Reader, error)

type file struct {
	fs.FileInfo

	open Opener
	path string
}

// Name implements thecluster.TemplateFile.
func (f *file) Name() string {
	return filepath.Base(f.path)
}

// Execute implements thecluster.TemplateFile.
func (f *file) Execute(w io.Writer, state any) error {
	r, err := f.open()
	if err != nil {
		return err
	}

	data, err := io.ReadAll(r)
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

func NewFile(path string, info fs.FileInfo, open Opener) File {
	f := &file{
		FileInfo: info,
		open:     open,
		path:     path,
	}

	return f
}
