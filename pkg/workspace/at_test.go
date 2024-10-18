package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("At", func() {
	DescribeTableSubtree("For fs type",
		Entry("OsFs", afero.NewOsFs()),
		Entry("BasePathFs", afero.NewBasePathFs(afero.NewOsFs(), "")),
		Entry("ReadOnlyFs", afero.NewReadOnlyFs(afero.NewOsFs())),
		func(root thecluster.Fs) {
			It("should re-use the fs when path is not specified", func() {
				ws := workspace.At(root, "")

				Expect(ws).NotTo(BeNil())
				Expect(ws.Fs()).To(BeIdenticalTo(root))
			})

			It("should create a new fs at path", func() {
				ws := workspace.At(root, "test-path")

				Expect(ws).NotTo(BeNil())
				Expect(ws.Fs()).NotTo(BeIdenticalTo(root))
				Expect(ws.Path()).To(Equal("test-path"))
			})
		},
	)
})
