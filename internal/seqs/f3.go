package seqs

import (
	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func FailFast2[K, V any, E error](s iter.Seq3[K, V, E]) (r iter.Seq2[K, V], err error) {
	visit := func(acc iter.Seq2[K, V], k K, v V, e E) iter.Seq2[K, V] {
		var inner error = e
		if inner != nil && err == nil {
			err = inner
		}
		if err != nil {
			return acc
		}

		return Append2(acc, k, v)
	}

	r = Reduce3(s, visit, iter.Empty2[K, V]())
	if err != nil {
		return nil, err
	}

	return r, nil
}

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
