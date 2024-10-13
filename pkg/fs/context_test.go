package fs_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/testing"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("Context", func() {
	var mock *testing.MockFs

	BeforeEach(func() {
		mock = testing.NewMockFs()
	})

	It("should round trip", func(ctx context.Context) {
		ctx = fs.WithContext(ctx, mock.Fs())
		actual := fs.FromContext(ctx)

		Expect(actual).To(Equal(mock))
	})

	It("should use a readonly Fs when none is provided", func(ctx context.Context) {
		actual := fs.FromContext(ctx)

		_, ok := actual.(thecluster.WritableFs)
		Expect(ok).To(BeFalseBecause("the fs is not writable"))
	})
})
