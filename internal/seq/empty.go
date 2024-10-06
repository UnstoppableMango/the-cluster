package seq

import "iter"

func Empty[V any]() iter.Seq[V] {
	return func(yield func(V) bool) {}
}
