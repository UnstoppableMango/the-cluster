package seq_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seq"
	"github.com/unstoppablemango/the-cluster/internal/slices"
)

var _ = Describe("F", func() {
	Context("Append", func() {
		It("should append an item to an empty sequence", func() {
			result := seq.Append(seq.Empty[int](), 69)

			Expect(slices.Collect(result)).To(HaveExactElements(69))
		})

		It("should append an item to a non-empty sequence", func() {
			result := seq.Append(iter.Singleton(69), 420)

			Expect(slices.Collect(result)).To(HaveExactElements(69, 420))
		})
	})
})
