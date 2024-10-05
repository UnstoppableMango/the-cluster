package template

import (
	"io/fs"
	"iter"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type tg = thecluster.TemplateGroup

type TemplatesResult result.R[tg]

type Templates = iter.Seq[TemplatesResult]

type walker struct {
	workspace thecluster.Workspace
	path      string
}

func (w *walker) Visit(path string, info fs.FileInfo, err error) error {
	if err != nil {
		return err
	}

	return nil
}

func (w *walker) Walk(yield func(TemplatesResult) bool) {
	if err := afero.Walk(w.workspace.Fs(), w.path, w.Visit); err != nil {
		_ = yield(result.Err[tg](err))
	}
}

func Discover(workspace thecluster.Workspace, path string) Templates {
	w := &walker{workspace, path}
	return w.Walk
}
