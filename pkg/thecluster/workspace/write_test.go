package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Write", func() {
	base := workspace.Empty()

	Context("Edit", func() {
		It("should create a writable fs layer", func() {
			actual := workspace.Edit(base)

			Expect(actual).NotTo(BeNil())
			Expect(actual).NotTo(BeIdenticalTo(base))
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
				base = workspace.Edit(workspace.Empty())
			})

			It("should use the existing writable workspace", func() {
				actual := workspace.Edit(base)

				Expect(actual).To(BeIdenticalTo(base))
			})
		})
	})
})
