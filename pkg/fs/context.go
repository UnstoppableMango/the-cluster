package fs

import (
	"context"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type key struct{}

// FromContext returns the Fs from the given context.
// This will return a read-only Os filesystem if no
// filesystem is found in context
func FromContext(ctx context.Context) thecluster.Fs {
	if fs, ok := ctx.Value(key{}).(thecluster.Fs); ok {
		return fs
	}

	log.FromContext(ctx).Debug("no fs found in context")
	return ReadOnly()
}

// WithContext returns a copy of parent containging the given fs
func WithContext(parent context.Context, fs thecluster.Fs) context.Context {
	return context.WithValue(parent, key{}, fs)
}
