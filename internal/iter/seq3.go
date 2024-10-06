package iter

import (
	"github.com/unstoppablemango/tdl/pkg/result"
)

type Seq3[T, U, V any] func(yield func(T, U, V) bool)

func FilterR[T, U, V any](seq Seq3[T, U, result.R[V]]) Seq3[T, U, V] {
	filtered := Filter(seq, func(_ T, _ U, v result.R[V]) bool {
		return v.IsOk()
	})

	return Map3(filtered, func(t T, u U, v result.R[V]) (T, U, V) {
		return t, u, v.GetValue()
	})
}

func Filter[T, U, V any](seq Seq3[T, U, V], p func(T, U, V) bool) Seq3[T, U, V] {
	return func(yield func(T, U, V) bool) {
		seq(func(t T, u U, v V) bool {
			if p(t, u, v) {
				return yield(t, u, v)
			}

			return true
		})
	}
}

func Map3[T, U, V any, X, Y, Z any](seq Seq3[T, U, V], f func(T, U, V) (X, Y, Z)) Seq3[X, Y, Z] {
	return func(yield func(X, Y, Z) bool) {
		seq(func(t T, u U, v V) bool {
			x, y, z := f(t, u, v)
			return yield(x, y, z)
		})
	}
}

func Reduce3[T, U, V, X any](seq Seq3[T, U, V], f func(X, T, U, V) X, initial X) X {
	state := initial
	seq(func(t T, u U, v V) bool {
		state = f(state, t, u, v)
		return true
	})

	return state
}
