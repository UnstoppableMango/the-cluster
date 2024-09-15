package thecluster_test

import (
	"context"
	"os"
	"path"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
	"github.com/unstoppablemango/the-cluster/internal/thecluster"
)

var _ = Describe("Reconciler", func() {
	var (
		root = os.TempDir()
		work string
		sut  thecluster.Reconciler
	)

	BeforeEach(func() {
		var err error
		work, err = os.MkdirTemp("", "")
		Expect(err).NotTo(HaveOccurred())
		wd, err := os.Getwd()
		Expect(err).NotTo(HaveOccurred())
		programPath := path.Join(wd, "testdata", "program")
		err = os.CopyFS(work, os.DirFS(programPath))
		Expect(err).NotTo(HaveOccurred())

		sut = thecluster.Reconciler{
			Config: thecluster.NewConfig(root),
		}
	})

	AfterEach(func() {
		err := os.RemoveAll(work)
		Expect(err).NotTo(HaveOccurred())
	})

	DescribeTable("Reconcile",
		func(ctx context.Context, req *tc.ReconcileRequest, res *tc.ReconcileResponse) {
			actual, err := sut.Reconcile(ctx, req)

			Expect(err).NotTo(HaveOccurred())
			Expect(actual).To(Equal(res))
		},
		Entry("should use config root", &tc.ReconcileRequest{}, &tc.ReconcileResponse{
			Root: root,
		}),
	)
})
