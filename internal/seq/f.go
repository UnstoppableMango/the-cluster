package seq

import (
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func Append[V any](seq iter.Seq[V], v V) iter.Seq[V] {
	return func(yield func(V) bool) {
		seq(yield)
		yield(v)
	}
}

func FilterR[V any](seq iter.Seq[result.R[V]]) iter.Seq[V] {
	filtered := Filter(seq, func(v result.R[V]) bool {
		return v.IsOk()
	})

	return Map(filtered, func(v result.R[V]) V {
		return v.GetValue()
	})
}

func Filter[V any](seq iter.Seq[V], predicate func(V) bool) iter.Seq[V] {
	return func(yield func(V) bool) {
		seq(func(v V) bool {
			if predicate(v) {
				return yield(v)
			}

			return true
		})
	}
}

func Map[V, X any](seq iter.Seq[V], f func(V) X) iter.Seq[X] {
	return func(yield func(X) bool) {
		seq(func(v V) bool {
			return yield(f(v))
		})
	}
}
