package fs_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/fs"
)

var _ = Describe("Fs", func() {
	It("should default to root", func() {
		options := fs.Options{}

		Expect(options.Root()).To(Equal("/"))
	})

	It("should apply root option", func() {
		options := fs.Options{}

		actual := fs.WithRoot("testing")(options)

		Expect(actual.Root()).To(Equal("testing"))
	})
})
