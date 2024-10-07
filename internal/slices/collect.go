package slices

import (
	"slices"

	"github.com/unstoppablemango/the-cluster/internal/iter"
)

func Collect[E any](s iter.Seq[E]) []E {
	return slices.Collect(iter.D(s))
}
