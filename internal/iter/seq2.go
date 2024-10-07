package iter

import (
	"iter"
)

type (
	Seq2[K, V any] iter.Seq2[K, V]
)

func D2[K, V any](seq Seq2[K, V]) iter.Seq2[K, V] {
	return iter.Seq2[K, V](seq)
}

func U2[K, V any](seq iter.Seq2[K, V]) Seq2[K, V] {
	return Seq2[K, V](seq)
}

func Pull2[K, V any](seq Seq2[K, V]) (next func() (K, V, bool), stop func()) {
	return iter.Pull2(iter.Seq2[K, V](seq))
}

func Singleton2[K, V any](k K, v V) Seq2[K, V] {
	return func(yield func(K, V) bool) {
		_ = yield(k, v)
	}
}
