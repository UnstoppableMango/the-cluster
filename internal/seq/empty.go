package seq

import "github.com/unstoppablemango/the-cluster/internal/iter"

func Empty[V any]() iter.Seq[V] {
	return func(yield func(V) bool) {}
}
