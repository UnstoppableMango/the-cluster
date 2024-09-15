package thecluster_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
	"github.com/unstoppablemango/the-cluster/internal/thecluster"
)

var _ = Describe("Reconciler", func() {
	sut := thecluster.Reconciler{}

	It("should reconcile", func(ctx context.Context) {
		res, err := sut.Reconcile(ctx, &tc.ReconcileRequest{})

		Expect(err).NotTo(HaveOccurred())
		Expect(res).To(Equal(&tc.ReconcileResponse{}))
	})

	DescribeTable("Reconcile",
		func(ctx context.Context, req *tc.ReconcileRequest, res *tc.ReconcileResponse) {
			actual, err := sut.Reconcile(ctx, req)

			Expect(err).NotTo(HaveOccurred())
			Expect(actual).To(Equal(res))
		},
		Entry("simple", &tc.ReconcileRequest{}, &tc.ReconcileResponse{}),
	)
})
