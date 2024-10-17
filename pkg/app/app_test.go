package app_test

import (
	"context"
	"os"
	"path/filepath"
	"slices"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/packagejson"
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

		It("should fail when an empty package.json exists", func() {
			Expect(mockRoot.Create(filepath.Join(path, "package.json"))).NotTo(BeNil())

			_, err := a.Dependencies()

			Expect(err).To(HaveOccurred())
		})

		It("should fail when package.json has invalid content", func() {
			file, err := mockRoot.Create(filepath.Join(path, "package.json"))
			Expect(err).NotTo(HaveOccurred())
			Expect(file.Write([]byte("gobbldygook"))).To(Satisfy(func(n int) bool { return n > 0 }))

			_, err = a.Dependencies()

			Expect(err).To(HaveOccurred())
		})

		Context("when a valid package.json exists", func() {
			BeforeEach(func() {
				dir := afero.NewBasePathFs(mockRoot, path)
				Expect(packagejson.Write(dir, packagejson.PackageJson{
					Name: "testing apps",
				})).To(Succeed())
			})

			It("should succeed", func() {
				_, err := a.Dependencies()

				Expect(err).NotTo(HaveOccurred())
			})

			It("should list dependencies", func() {
				deps, err := a.Dependencies()

				Expect(err).NotTo(HaveOccurred())
				Expect(slices.Collect(iter.D(deps))).To(HaveLen(0))
			})

			Context("and unsupported dependencies exist", func() {
				BeforeEach(func() {
					dir := afero.NewBasePathFs(mockRoot, path)
					Expect(packagejson.Write(dir, packagejson.PackageJson{
						Name: "testing apps",
						Depencencies: map[string]string{
							"mypackage": "v69",
						},
					})).To(Succeed())
				})

				It("should succeed", func() {
					_, err := a.Dependencies()

					Expect(err).NotTo(HaveOccurred())
				})

				It("should list zero dependencies", func() {
					deps, err := a.Dependencies()

					Expect(err).NotTo(HaveOccurred())
					Expect(slices.Collect(iter.D(deps))).To(HaveLen(0))
				})
			})

			Context("and supported dependencies exist", func() {
				BeforeEach(func() {
					dir := afero.NewBasePathFs(mockRoot, path)
					Expect(packagejson.Write(dir, packagejson.PackageJson{
						Name: "testing apps",
						Depencencies: map[string]string{
							"@unstoppablemango/thecluster": "v69",
						},
					})).To(Succeed())
				})

				It("should succeed", func() {
					_, err := a.Dependencies()

					Expect(err).NotTo(HaveOccurred())
				})

				It("should list dependencies", func() {
					deps, err := a.Dependencies()

					Expect(err).NotTo(HaveOccurred())
					Expect(slices.Collect(iter.D(deps))).To(HaveLen(1))
				})
			})
		})
	})
})
