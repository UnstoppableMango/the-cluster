package fs_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/testing"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("Changes", func() {
	var base *testing.MockFs
	var tracker fs.ChangeTracker

	BeforeEach(func() {
		base = testing.NewMockFs()
	})

	Context("Persist", func() {
		var target thecluster.WritableFs

		BeforeEach(func() {
			target = testing.NewMockFs()
		})

		It("should succeed", func() {
			Expect(fs.Persist(tracker, target)).To(Succeed())
		})

		Context("when a file has been changed", func() {
			var testFile string

			BeforeEach(func() {
				testFile = "test.txt"
				Expect(base.Create(testFile)).NotTo(BeNil())
			})

			It("should persist the file", func() {
				Expect(fs.Persist(tracker, target)).To(Succeed())

				Expect(target.Open(testFile)).NotTo(BeNil())
			})
		})
	})
})
