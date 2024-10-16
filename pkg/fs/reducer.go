package fs

import (
	"io/fs"

	"github.com/unmango/go/iter/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Cursor interface {
	Path() string
	Info() fs.FileInfo
}

type cursor[V any] struct {
	path string
	info fs.FileInfo
	v    V
	err  error
}

func (c *cursor[V]) Info() fs.FileInfo {
	return c.info
}

func (c *cursor[V]) Path() string {
	return c.path
}

func (c *cursor[V]) advance(
	v V,
	path string,
	info fs.FileInfo,
	err error,
) (V, Cursor, error) {
	c.v = v
	c.path = path
	c.info = info
	c.err = err

	return c.v, c, c.err
}

type (
	Reducer[V any]    func(string, fs.FileInfo, error) V
	Accumulate[V any] func(V, Cursor, error) V
)

func NewReducer[V any](f Accumulate[V]) func(V, string, fs.FileInfo, error) V {
	cursor := &cursor[V]{}
	return func(v V, path string, info fs.FileInfo, err error) V {
		return f(cursor.advance(v, path, info, err))
	}
}

func Reduce[V any](fs thecluster.Fs, root string, f Accumulate[V], initial V) V {
	return seqs.Reduce3(Iter(fs, root), NewReducer(f), initial)
}
