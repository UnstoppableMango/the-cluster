package template

import (
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seq"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type tg = thecluster.TemplateGroup

type (
	groupResult = result.R[tg]
)

type group struct {
	name string

	Path string
	Info fs.FileInfo
}

// Name implements thecluster.TemplateGroup.
func (g *group) Name() string {
	return g.name
}

// Templates implements thecluster.TemplateGroup.
func (g *group) Templates() iter.Seq[thecluster.Template] {
	panic("unimplemented")
}

var _ thecluster.TemplateGroup = &group{}

type walker struct {
	workspace thecluster.Workspace
	path      string
}

func (w *walker) Iter() iter.Seq[groupResult] {
	visit := func(results iter.Seq[groupResult], c fs.Cursor, err error) iter.Seq[groupResult] {
		var r groupResult
		done := func() iter.Seq[groupResult] {
			if r != nil {
				return seq.Append(results, r)
			} else {
				return results
			}
		}

		if err != nil {
			r = result.Err[tg](err)
			return done()
		}

		var g thecluster.TemplateGroup = &group{
			name: "TODO",
			Path: c.Path(),
			Info: c.Info(),
		}

		r = result.Ok(g)
		return done()
	}

	return fs.Reduce(w.workspace.Fs(), w.path, visit, nil)
}

func Discover(workspace thecluster.Workspace, path string) iter.Seq[groupResult] {
	w := &walker{workspace, path}
	return w.Iter()
}
