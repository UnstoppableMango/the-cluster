package template

import (
	"path/filepath"

	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seq"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

const (
	RelativePath = "templates"
)

type (
	GroupResult = result.R[thecluster.TemplateGroup]
	tg          = thecluster.TemplateGroup
)

func Discover(workspace thecluster.Workspace, path string) iter.Seq[GroupResult] {
	var currentGroup GroupResult

	reducer := func(results iter.Seq[GroupResult], c fs.Cursor, err error) iter.Seq[GroupResult] {
		done := func(r GroupResult) iter.Seq[GroupResult] {
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
			p, err := filepath.Rel(path, c.Path())
			if err != nil {
				return done(result.Err[tg](err))
			}

			if len(filepath.SplitList(p)) == 1 {
				if p == "." {
					return results
				}

				r := done(currentGroup)
				currentGroup = result.Ok(
					NewGroup(workspace, c.Path(), c.Info()),
				)

				return r
			}
		}

		return results
	}

	return fs.Reduce(workspace.Fs(), path, reducer, seq.Empty[GroupResult]())
}
