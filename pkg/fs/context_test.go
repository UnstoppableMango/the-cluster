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
		actual := fs.FromContext(ctx)

		Expect(actual).To(Equal(mock))
	})

	It("should use a readonly Fs when none is provided", func(ctx context.Context) {
		actual := fs.FromContext(ctx)

		_, err := actual.Create("test.txt")
		Expect(err).To(HaveOccurred())
	})
})
