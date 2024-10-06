package iter

import (
	"iter"
)

type (
	Seq[V any] iter.Seq[V]
)

func Downcast[V any](seq Seq[V]) iter.Seq[V] {
	return iter.Seq[V](seq)
}

func Upcast[V any](seq iter.Seq[V]) Seq[V] {
	return Seq[V](seq)
}

func Pull[V any](seq Seq[V]) (next func() (V, bool), stop func()) {
	return iter.Pull(iter.Seq[V](seq))
}
