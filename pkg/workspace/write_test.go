package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Write", func() {
	var base thecluster.Workspace

	BeforeEach(func() {
		base = workspace.Empty()
	})

	Context("writable", func() {
		var writable workspace.Writable

		BeforeEach(func() {
			writable = workspace.Edit(base)
		})

		It("should write a file", func() {
			fs := writable.Fs()

			Expect(fs.Create("test.txt")).NotTo(BeNil())

			Expect(fs.Open("test.txt")).NotTo(BeNil())
		})

		It("should persist changes in Changes", func() {
			fs := writable.Fs()
			changes := writable.Changes()

			Expect(fs.Create("test.txt")).NotTo(BeNil())

			Expect(changes.Open("test.txt")).NotTo(BeNil())
		})

		It("should NOT persist changes in Base", func() {
			fs := writable.Fs()
			base := writable.Base()

			Expect(fs.Create("test.txt")).NotTo(BeNil())

			_, err := base.Open("test.txt")
			Expect(err).To(HaveOccurred())
		})

		It("should contain existing files in Base", func() {
			base := base.Fs()
			fs := writable.Fs()

			Expect(base.Create("test.txt")).NotTo(BeNil())

			Expect(fs.Open("test.txt")).NotTo(BeNil())
			Expect(writable.Base().Open("test.txt")).NotTo(BeNil())
		})

		Context("Changes", func() {
			It("should not include the base layer", func() {
				base := base.Fs()
				changes := writable.Changes()

				Expect(base.Create("test.txt")).NotTo(BeNil())

				_, err := changes.Open("test.txt")
				Expect(err).To(HaveOccurred())
			})
		})
	})

	Context("Edit", func() {
		It("should create a Writable fs layer", func() {
			actual := workspace.Edit(base)

			Expect(actual).NotTo(BeNil())
			Expect(actual).NotTo(BeIdenticalTo(base))
		})

		It("should use the workspace fs as the base", func() {
			actual := workspace.Edit(base)

			Expect(actual.Base()).To(BeIdenticalTo(base.Fs()))
		})

		It("should create a change-tracking layer", func() {
			actual := workspace.Edit(base)

			Expect(actual.Changes()).NotTo(BeIdenticalTo(base.Fs()))
			Expect(actual.Changes()).NotTo(BeIdenticalTo(actual.Fs()))
			Expect(actual.Changes()).NotTo(BeIdenticalTo(actual.Base()))
		})

		Context("when ws is nil", func() {
			BeforeEach(func() {
				base = nil
			})

			It("should return nil", func() {
				actual := workspace.Edit(base)

				Expect(actual).To(BeNil())
			})
		})

		Context("when ws is writable", func() {
			BeforeEach(func() {
				base = workspace.Edit(base)
			})

			It("should use the existing writable workspace", func() {
				actual := workspace.Edit(base)

				Expect(actual).To(BeIdenticalTo(base))
			})
		})
	})
})
