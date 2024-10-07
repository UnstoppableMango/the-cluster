package iter

import (
	"iter"
)

type (
	Seq[V any] iter.Seq[V]
)

func D[V any](seq Seq[V]) iter.Seq[V] {
	return iter.Seq[V](seq)
}

func U[V any](seq iter.Seq[V]) Seq[V] {
	return Seq[V](seq)
}

func Pull[V any](seq Seq[V]) (next func() (V, bool), stop func()) {
	return iter.Pull(iter.Seq[V](seq))
}

func Empty[V any]() Seq[V] {
	return func(yield func(V) bool) {}
}

func Singleton[V any](v V) Seq[V] {
	return func(yield func(V) bool) {
		yield(v)
	}
}
