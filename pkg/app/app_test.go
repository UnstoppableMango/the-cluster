package app_test

import (
	"context"
	"os"
	"path/filepath"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"

	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("App", func() {
	Context("Load", func() {
		var fsys thecluster.Fs

		BeforeEach(func() {
			fsys = afero.NewMemMapFs()
		})

		Context("when the path does not exist", func() {
			It("should fail", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, "test")

				Expect(app).To(BeNil())
				Expect(err).To(HaveOccurred())
			})
		})

		Context("when the path is a file", func() {
			const file = "test.txt"

			BeforeEach(func() {
				Expect(fsys.Create(file)).NotTo(BeNil())
			})

			It("should fail", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, file)

				Expect(app).To(BeNil())
				Expect(err).To(HaveOccurred())
			})

			Context("and path is absolute", func() {
				It("should fail", func(ctx context.Context) {
					path, err := filepath.Abs(file)
					Expect(err).NotTo(HaveOccurred())

					app, err := app.Load(ctx, fsys, path)

					Expect(app).To(BeNil())
					Expect(err).To(HaveOccurred())
				})
			})
		})

		Context("when the path is a directory", func() {
			const (
				dir     = "test"
				appPath = "apps/test"
			)

			BeforeEach(func() {
				Expect(fsys.MkdirAll(appPath, os.ModeDir)).To(Succeed())
			})

			It("should succeed", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app).NotTo(BeNil())
			})

			It("should have a workspace", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace()).NotTo(BeNil())
			})

			It("should have a filesystem", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).NotTo(BeNil())
			})

			It("should not use the given filesystem", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).NotTo(BeIdenticalTo(fsys))
			})

			It("should have a pulumi workspace", func(ctx context.Context) {
				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).NotTo(BeNil())
			})

			It("should prepend the apps directory", func(ctx context.Context) {
				expectedFs := afero.NewBasePathFs(fsys, filepath.Join("apps", dir))

				app, err := app.Load(ctx, fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).To(Equal(expectedFs))
			})

			Context("and directory has two segments", func() {
				It("should fail", func(ctx context.Context) {
					path := filepath.Join(dir, "other")
					app, err := app.Load(ctx, fsys, path)

					Expect(app).To(BeNil())
					Expect(err).To(HaveOccurred())
				})

				It("should fail with not supported", func(ctx context.Context) {
					path := filepath.Join(dir, "other")
					_, err := app.Load(ctx, fsys, path)

					Expect(err).To(MatchError(app.ErrNotSuppported))
				})
			})

			Context("and path starts with apps/", func() {
				It("should succeed", func(ctx context.Context) {
					app, err := app.Load(ctx, fsys, appPath)

					Expect(err).NotTo(HaveOccurred())
					Expect(app).NotTo(BeNil())
				})

				It("should prepend the apps directory", func(ctx context.Context) {
					expectedFs := afero.NewBasePathFs(fsys, appPath)

					app, err := app.Load(ctx, fsys, dir)

					Expect(err).NotTo(HaveOccurred())
					Expect(app.Workspace().Fs()).To(Equal(expectedFs))
				})
			})

			Context("and directory is absolute", func() {
				It("should fail", func(ctx context.Context) {
					path, err := filepath.Abs(dir)
					Expect(err).NotTo(HaveOccurred())

					app, err := app.Load(ctx, fsys, path)

					Expect(app).To(BeNil())
					Expect(err).To(HaveOccurred())
				})
			})
		})
	})
})
