package template

import (
	"path/filepath"

	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type tmpl struct {
	fs   thecluster.Fs
	info fs.FileInfo
	path string
}

// Name implements thecluster.Template.
func (t *tmpl) Name() string {
	return filepath.Base(t.path)
}

// Files implements thecluster.Template.
func (t *tmpl) Files() iter.Seq[thecluster.TemplateFile] {
	visit := func(
		files iter.Seq[thecluster.TemplateFile],
		path string,
		info fs.FileInfo,
		err error,
	) iter.Seq[thecluster.TemplateFile] {
		if err != nil {
			return files
		}

		file, err := t.fs.Open(path)
		if err != nil {
			return files
		}

		return seqs.Append(files,
			NewFile(path, file),
		)
	}

	return seqs.Reduce3(
		fs.IterFiles(t.fs, ""),
		visit,
		iter.Empty[thecluster.TemplateFile](),
	)
}

var _ thecluster.Template = &tmpl{}

func New(ws thecluster.Workspace, path string, info fs.FileInfo) thecluster.Template {
	g := &tmpl{
		fs:   fs.ScopeTo(ws.Fs(), path),
		path: path,
		info: info,
	}

	return g
}
