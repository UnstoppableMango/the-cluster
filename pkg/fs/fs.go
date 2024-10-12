package fs

import (
	"os"

	"github.com/unstoppablemango/the-cluster/internal/option"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Options struct {
	root *string
}

func (o Options) Root() string {
	if o.root != nil {
		return *o.root
	} else {
		return "/"
	}
}

var (
	initial = Options{}
	mut     = option.Mut[Options, *Options, Option]
)

type Option func(Options) Options

func New(options ...Option) thecluster.Fs {
	opts := option.WithAll(initial, options)

	return os.DirFS(opts.Root())
}

func WithRoot(root string) Option {
	return mut(func(o *Options) {
		o.root = &root
	})
}
