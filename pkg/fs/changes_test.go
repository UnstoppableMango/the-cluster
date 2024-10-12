package fs_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"

	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("Changes", func() {
	var base thecluster.Fs
	var tracker fs.ChangeTracker

	BeforeEach(func() {
		base = afero.NewMemMapFs()
	})

	Context("Persist", func() {
		var target thecluster.Fs

		BeforeEach(func() {
			target = afero.NewMemMapFs()
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
