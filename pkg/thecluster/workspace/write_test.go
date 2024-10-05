package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Write", func() {
	base := workspace.Empty()

	Context("Writable", func() {
		It("should create a writable fs layer", func() {
			actual := workspace.Writable(base)

			Expect(actual).NotTo(BeNil())
			Expect(actual).NotTo(BeIdenticalTo(base))
		})

		Context("when ws is already writable", func() {
			BeforeEach(func() {
				base = workspace.Writable(workspace.Empty())
			})

			It("should use the existing writable workspace", func() {
				actual := workspace.Writable(base)

				Expect(actual).To(BeIdenticalTo(base))
			})
		})
	})
})
