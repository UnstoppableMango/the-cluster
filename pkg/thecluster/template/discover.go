package template

import (
	"io/fs"
	"path/filepath"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type tg = thecluster.TemplateGroup

type (
	groupResult     = result.R[tg]
	templatesResult = iter.Seq[groupResult]
)

type Templates struct {
	iter.Seq[tg]
}

type (
	VisitFunc = filepath.WalkFunc
	WalkFunc  = templatesResult
)

type walker struct {
	workspace thecluster.Workspace
	path      string
}

type visitor struct {
	*walker
	yield func(groupResult) bool
}

func (v *visitor) Visit(path string, info fs.FileInfo, err error) error {
	if err != nil {
		return err
	}

	return nil
}

func (w *walker) Walk(yield func(groupResult) bool) {
	err := afero.Walk(
		w.workspace.Fs(),
		w.path,
		Visitor(w, yield),
	)
	if err != nil {
		_ = yield(result.Err[tg](err))
	}
}

func (w *walker) Visitor(yield func(groupResult) bool) VisitFunc {
	v := &visitor{w, yield}
	return v.Visit
}

func Visitor(walker *walker, yield func(groupResult) bool) VisitFunc {
	return walker.Visitor(yield)
}

func Discover(workspace thecluster.Workspace, path string) Templates {
	w := &walker{workspace, path}
	return Templates{iter.FilterR(w.Walk)}
}
