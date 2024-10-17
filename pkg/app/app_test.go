package app_test

import (
	"context"
	"os"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("App", func() {
	var (
		path     string
		mockRoot thecluster.Fs
		a        thecluster.App
	)

	BeforeEach(func(ctx context.Context) {
		var err error

		path = "apps/test"
		mockRoot = afero.NewMemMapFs()
		Expect(mockRoot.MkdirAll(path, os.ModeDir)).To(Succeed())
		a, err = app.Load(ctx, mockRoot, path)
		Expect(err).NotTo(HaveOccurred())
	})

	Context("Dependencies", func() {
		It("should fail when package.json does not exist", func() {
			_, err := a.Dependencies()

			Expect(err).To(HaveOccurred())
		})
	})
})
