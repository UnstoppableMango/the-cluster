package seq

import (
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func Append2[K, V any](seq iter.Seq2[K, V], k K, v V) iter.Seq2[K, V] {
	return func(yield func(K, V) bool) {
		seq(yield)
		_ = yield(k, v)
	}
}

func Filter2[K, V any](seq iter.Seq2[K, V], predicate func(K, V) bool) iter.Seq2[K, V] {
	return func(yield func(K, V) bool) {
		seq(func(k K, v V) bool {
			if predicate(k, v) {
				return yield(k, v)
			} else {
				return true
			}
		})
	}
}

func Map2[K, V any, X, Y any](seq iter.Seq2[K, V], f func(K, V) (X, Y)) iter.Seq2[X, Y] {
	return func(yield func(X, Y) bool) {
		seq(func(k K, v V) bool {
			return yield(f(k, v))
		})
	}
}

func Reduce2[K, V, X any](seq iter.Seq2[K, V], f func(X, K, V) X, initial X) X {
	state := initial
	seq(func(k K, v V) bool {
		state = f(state, k, v)
		return true
	})

	return state
}
