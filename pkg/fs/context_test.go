package fs_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
)

var _ = Describe("Context", func() {
	mock := afero.NewMemMapFs()

	It("should round trip", func(ctx context.Context) {
		ctx = fs.WithContext(ctx, mock)
		actual, err := fs.FromContext(ctx)

		Expect(err).NotTo(HaveOccurred())
		Expect(actual).To(Equal(mock))
	})
})
