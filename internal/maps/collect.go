package maps

import (
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func Collect[K comparable, V any](s iter.Seq2[K, V]) map[K]V {
	result := map[K]V{}
	for k, v := range s {
		result[k] = v
	}

	return result
}
