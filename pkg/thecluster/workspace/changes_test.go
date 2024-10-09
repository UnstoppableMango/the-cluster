package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Changes", func() {
	var base thecluster.Workspace
	var tracker workspace.ChangeTracker

	BeforeEach(func() {
		base = workspace.Edit(workspace.Empty())
		tracker = workspace.Edit(base)
	})

	Context("Persist", func() {
		var target thecluster.Fs

		BeforeEach(func() {
			target = afero.NewMemMapFs()
		})

		It("should succeed", func() {
			Expect(workspace.Persist(tracker, target)).To(Succeed())
		})

		Context("when a file has been changed", func() {
			var testFile string

			BeforeEach(func() {
				testFile = "test.txt"
				Expect(base.Fs().Create(testFile)).NotTo(BeNil())
			})

			It("should persist the file", func() {
				Expect(workspace.Persist(tracker, target)).To(Succeed())

				Expect(target.Open(testFile)).NotTo(BeNil())
			})
		})
	})
})
