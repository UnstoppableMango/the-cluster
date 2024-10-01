package fs

import (
	"context"
	"errors"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type key struct{}

func FromContext(ctx context.Context) (thecluster.Fs, error) {
	if fs, ok := ctx.Value(key{}).(thecluster.Fs); ok {
		return fs, nil
	} else {
		return nil, errors.New("no fs found in context")
	}
}

func WithContext(ctx context.Context, fs thecluster.Fs) context.Context {
	return context.WithValue(ctx, key{}, fs)
}
