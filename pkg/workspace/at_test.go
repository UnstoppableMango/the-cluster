package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = FDescribe("At", func() {
	DescribeTable("When path is not specified",
		Entry("should re-use the OsFs", afero.NewOsFs()),
		Entry("should re-use the BasePathFs", afero.NewBasePathFs(afero.NewOsFs(), "")),
		Entry("should re-use the ReadOnlyFs", afero.NewReadOnlyFs(afero.NewOsFs())),
		func(root thecluster.Fs) {
			ws := workspace.At(root, "")

			Expect(ws).NotTo(BeNil())
			Expect(ws.Fs()).To(BeIdenticalTo(root))
		},
	)

	DescribeTable("When path is specified",
		Entry("should re-use the OsFs", afero.NewOsFs()),
		Entry("should re-use the BasePathFs", afero.NewBasePathFs(afero.NewOsFs(), "")),
		Entry("should re-use the ReadOnlyFs", afero.NewReadOnlyFs(afero.NewOsFs())),
		func(root thecluster.Fs) {
			ws := workspace.At(root, "")

			Expect(ws).NotTo(BeNil())
			Expect(ws.Fs()).To(BeIdenticalTo(root))
		},
	)
})
