package fs

import (
	"context"
	"errors"
)

type key struct{}

func FromContext(ctx context.Context) (Fs, error) {
	if fs, ok := ctx.Value(key{}).(Fs); ok {
		return fs, nil
	} else {
		return nil, errors.New("no fs found in context")
	}
}

func WithContext(ctx context.Context, fs Fs) context.Context {
	return context.WithValue(ctx, key{}, fs)
}
