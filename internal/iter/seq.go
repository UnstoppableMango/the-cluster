package iter

import (
	"iter"

	"github.com/unstoppablemango/tdl/pkg/result"
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

func FilterR[V any](seq Seq[result.R[V]]) Seq[V] {
	filtered := Filter(seq, func(v result.R[V]) bool {
		return v.IsOk()
	})

	return Map(filtered, func(v result.R[V]) V {
		return v.GetValue()
	})
}

func Filter[V any](seq Seq[V], predicate func(V) bool) Seq[V] {
	return func(yield func(V) bool) {
		seq(func(v V) bool {
			if predicate(v) {
				return yield(v)
			}

			return true
		})
	}
}

func Map[V, X any](seq Seq[V], f func(V) X) Seq[X] {
	return func(yield func(X) bool) {
		seq(func(v V) bool {
			return yield(f(v))
		})
	}
}

func Pull[V any](seq Seq[V]) (next func() (V, bool), stop func()) {
	return iter.Pull(iter.Seq[V](seq))
}
