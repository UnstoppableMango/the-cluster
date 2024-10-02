package app_test

import (
	"context"
	"path/filepath"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/app"
)

var _ = Describe("Init", func() {
	const mockDirectory = "some/dir"

	var (
		mockFs thecluster.Fs
		root   string
	)

	BeforeEach(func() {
		var err error
		mockFs = afero.NewMemMapFs()
		root, err = util.GitRoot()
		Expect(err).NotTo(HaveOccurred())
	})

	JustBeforeEach(func(ctx context.Context) {
		Expect(app.Init(ctx, mockFs, mockDirectory)).To(Succeed())
	})

	It("should create the app directory", func() {
		d, err := mockFs.Stat(filepath.Join(root, mockDirectory))
		Expect(err).NotTo(HaveOccurred())
		Expect(d.IsDir()).To(BeTrueBecause("the directory was created"))
	})

	It("should create Pulumi.yaml", func() {
		f, err := mockFs.Open(filepath.Join(root, mockDirectory, "Pulumi.yaml"))
		Expect(err).NotTo(HaveOccurred())

		stat, err := f.Stat()
		Expect(err).NotTo(HaveOccurred())
		Expect(stat.IsDir()).To(BeFalseBecause("Pulumi.yaml is a file"))
	})
})
