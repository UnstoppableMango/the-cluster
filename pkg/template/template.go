package template

import (
	"path/filepath"

	"github.com/unmango/go/iter"
	"github.com/unmango/go/iter/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type tmpl struct {
	fs   thecluster.Fs
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

		return seqs.Append(files,
			NewFile(t.fs, path),
		)
	}

	return seqs.Reduce3(
		fs.IterFiles(t.fs, ""),
		visit,
		iter.Empty[thecluster.TemplateFile](),
	)
}

var _ thecluster.Template = &tmpl{}

func New(workspace thecluster.Fs, path string) thecluster.Template {
	g := &tmpl{
		fs:   fs.ScopeTo(workspace, path),
		path: path,
	}

	return g
}
