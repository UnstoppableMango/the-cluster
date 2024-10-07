package seq

import "github.com/unstoppablemango/the-cluster/internal/iter"

func Empty[V any]() iter.Seq[V] {
	return func(yield func(V) bool) {}
}

func Empty2[K, V any]() iter.Seq2[K, V] {
	return func(yield func(K, V) bool) {}
}
