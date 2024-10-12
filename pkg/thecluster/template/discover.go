package template

import (
	"path/filepath"

	"github.com/unmango/go/iter"
	"github.com/unmango/go/result"
	"github.com/unmango/go/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

const (
	RelativePath = "templates"
)

type (
	GroupResult = result.Result[thecluster.TemplateGroup]
)

type discoverOptions struct {
	path string
}

type DiscoverOption func(*discoverOptions)

func (op DiscoverOption) apply(options *discoverOptions) {
	op(options)
}

func WithPath(path string) DiscoverOption {
	return func(do *discoverOptions) {
		do.path = path
	}
}

func Discover(workspace thecluster.Fs, options ...DiscoverOption) iter.Seq[GroupResult] {
	opts := &discoverOptions{RelativePath}
	for _, op := range options {
		op.apply(opts)
	}

	var currentGroup GroupResult
	reducer := func(
		results iter.Seq[GroupResult],
		c fs.Cursor,
		err error,
	) iter.Seq[GroupResult] {
		done := func(r GroupResult) iter.Seq[GroupResult] {
			if r != nil {
				return seqs.Append(results, r)
			} else {
				return results
			}
		}

		if err != nil {
			return done(result.Err[thecluster.TemplateGroup](err))
		}

		if c.Info().IsDir() {
			p, err := filepath.Rel(opts.path, c.Path())
			if err != nil {
				return done(result.Err[thecluster.TemplateGroup](err))
			}

			if len(filepath.SplitList(p)) == 1 {
				if p == "." {
					return results
				}

				r := done(currentGroup)
				currentGroup = result.Ok(
					NewGroup(workspace, c.Path()),
				)

				return r
			}
		}

		return results
	}

	return fs.Reduce(workspace,
		opts.path, reducer,
		iter.Empty[GroupResult](),
	)
}
