package template

import (
	"errors"

	"github.com/unmango/go/option"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type findOptions struct {
	path string
}

type FindOption func(*findOptions)

var (
	ErrNotFound = errors.New("not found")
)

func Find(fsys thecluster.Fs, name string, options ...FindOption) (thecluster.Template, error) {
	opts := &findOptions{RelativePath}
	option.ApplyAll(opts, options)

	for g := range List(fsys, WithPath(opts.path)) {
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
