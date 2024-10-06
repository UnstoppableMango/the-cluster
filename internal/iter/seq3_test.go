package iter_test

import (
	"errors"
	"testing/quick"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/tdl/pkg/result"
	"github.com/unstoppablemango/the-cluster/internal/iter"
)

var _ = Describe("Seq3", func() {
	Context("FilterR", func() {
		It("should exlude err results", func() {
			var seq iter.Seq3[int, int, result.R[int]] = func(yield func(int, int, result.R[int]) bool) {
				yield(0, 0, result.Err[int](errors.New("test err")))
			}

			result := iter.FilterR(seq)

			sentinel := false
			result(func(int, int, int) bool {
				sentinel = true
				return true
			})

			Expect(sentinel).To(BeFalseBecause("the sequence should be empty"))
		})
	})

	Context("Map3", func() {
		It("should map", func() {
			f := func(a0, b0, c0 int) bool {
				var seq iter.Seq3[int, int, int] = func(yield func(int, int, int) bool) {
					yield(a0, b0, c0)
				}

				result := iter.Map3(seq, func(a, b, c int) (int, int, int) {
					return a + 1, b + 1, c + 1
				})

				var a, b, c int
				result(func(a1, b1, c1 int) bool {
					a, b, c = a1, b1, c1
					return true
				})

				return a == a0+1 && b == b0+1 && c == c0+1
			}

			Expect(quick.Check(f, nil)).To(Succeed())
		})
	})
})
