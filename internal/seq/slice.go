package seq

import "github.com/unstoppablemango/the-cluster/internal/iter"

func FromSlice[V any](slice []V) iter.Seq[V] {
	return func(yield func(V) bool) {
		for _, v := range slice {
			if !yield(v) {
				return
			}
		}
	}
}

func ToSlice[V any](seq iter.Seq[V]) []V {
	result := []V{}
	for v := range seq {
		result = append(result, v)
	}
	return result
}
