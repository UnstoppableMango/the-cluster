package template

import (
	"bytes"
	"fmt"
	"path/filepath"
	"text/template"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type (
	File = thecluster.TemplateFile
)

type file struct {
	fs   thecluster.Fs
	path string
	tmpl *template.Template
}

// Name implements thecluster.TemplateFile.
func (f *file) Name() string {
	return filepath.Base(f.path)
}

// Execute implements thecluster.TemplateFile.
func (f *file) Execute(fs thecluster.Fs, state any) error {
	data, err := afero.ReadFile(f.fs, f.path)
	if err != nil {
		return fmt.Errorf("read src: %w", err)
	}

	tmpl, err := f.tmpl.Parse(string(data))
	if err != nil {
		return fmt.Errorf("parse template: %w", err)
	}

	target, err := fs.Create(f.path)
	if err != nil {
		return fmt.Errorf("target: %w", err)
	}
	defer func() {
		log.Info("closing target")
		if err := target.Close(); err != nil {
			log.Error("unable to close target file", "err", err)
		}
	}()

	buf := &bytes.Buffer{}
	if err = tmpl.Execute(buf, state); err != nil {
		return err
	}

	log.Error(buf.String())

	return tmpl.Execute(target, state)
}

var _ File = &file{}

func NewFile(fs thecluster.Fs, path string) File {
	r := &file{
		fs:   fs,
		path: path,
	}

	r.tmpl = template.New(
		r.Name(),
	)

	return r
}
