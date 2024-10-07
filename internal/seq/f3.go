package seq

import (
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func Filter3R[T, U, V any](seq iter.Seq3[T, U, result.R[V]]) iter.Seq3[T, U, V] {
	filtered := Filter3(seq, func(_ T, _ U, v result.R[V]) bool {
		return v.IsOk()
	})

	return Map3(filtered, func(t T, u U, v result.R[V]) (T, U, V) {
		return t, u, v.GetValue()
	})
}

func Filter3[T, U, V any](seq iter.Seq3[T, U, V], p func(T, U, V) bool) iter.Seq3[T, U, V] {
	return func(yield func(T, U, V) bool) {
		seq(func(t T, u U, v V) bool {
			if p(t, u, v) {
				return yield(t, u, v)
			}

			return true
		})
	}
}

func Map3[T, U, V any, X, Y, Z any](seq iter.Seq3[T, U, V], f func(T, U, V) (X, Y, Z)) iter.Seq3[X, Y, Z] {
	return func(yield func(X, Y, Z) bool) {
		seq(func(t T, u U, v V) bool {
			x, y, z := f(t, u, v)
			return yield(x, y, z)
		})
	}
}

func Reduce3[T, U, V, X any](seq iter.Seq3[T, U, V], f func(X, T, U, V) X, initial X) X {
	state := initial
	seq(func(t T, u U, v V) bool {
		state = f(state, t, u, v)
		return true
	})

	return state
}
