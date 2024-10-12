package template

import (
	"errors"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type findOptions struct {
	path string
}

type FindOption func(*findOptions)

func (op FindOption) apply(options *findOptions) {
	op(options)
}

var (
	ErrNotFound = errors.New("not found")
)

func Find(fs thecluster.Fs, name string, options ...FindOption) (thecluster.Template, error) {
	opts := &findOptions{RelativePath}
	for _, op := range options {
		op.apply(opts)
	}

	for g := range List(fs, opts.path) {
		templates, err := g.Templates()
		if err != nil {
			return nil, err
		}

		for t := range templates {
			if t.Name() == name {
				return t, nil
			}
		}
	}

	return nil, ErrNotFound
}
