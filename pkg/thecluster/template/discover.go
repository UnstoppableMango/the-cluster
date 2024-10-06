package template

import (
	"path/filepath"

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
	var currentGroup groupResult

	visit := func(results iter.Seq[groupResult], c fs.Cursor, err error) iter.Seq[groupResult] {
		done := func(r groupResult) iter.Seq[groupResult] {
			if r != nil {
				return seq.Append(results, r)
			} else {
				return results
			}
		}

		if err != nil {
			return done(result.Err[tg](err))
		}

		if c.Info().IsDir() {
			p, err := filepath.Rel(w.path, c.Path())
			if err != nil {
				return done(result.Err[tg](err))
			}

			if len(filepath.SplitList(p)) == 1 {
				if p == "." {
					return results
				}

				var g thecluster.TemplateGroup = &group{
					name: p,
					Path: c.Path(),
					Info: c.Info(),
				}

				r := done(currentGroup)
				currentGroup = result.Ok(g)
				return r
			}
		}

		return results
	}

	return fs.Reduce(w.workspace.Fs(), w.path, visit, seq.Empty[groupResult]())
}

func Discover(workspace thecluster.Workspace, path string) iter.Seq[groupResult] {
	w := &walker{workspace, path}
	return w.Iter()
}
