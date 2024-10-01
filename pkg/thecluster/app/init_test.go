package app_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/app"
)

var _ = Describe("Init", func() {
	const mockDirectory = "some/dir"
	var mockFs thecluster.Fs

	BeforeEach(func() {
		mockFs = afero.NewMemMapFs()
	})

	JustBeforeEach(func(ctx context.Context) {
		Expect(app.Init(ctx, mockFs, mockDirectory)).To(Succeed())
	})

	It("should fucking work", func() {
		d, err := mockFs.Stat(mockDirectory)
		Expect(err).NotTo(HaveOccurred())
		Expect(d.IsDir()).To(BeTrueBecause("the directory was created"))
	})
})
