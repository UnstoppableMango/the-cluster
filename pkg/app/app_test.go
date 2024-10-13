package app_test

import (
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
			It("should fail", func() {
				app, err := app.Load(fsys, "test")

				Expect(app).To(BeNil())
				Expect(err).To(HaveOccurred())
			})
		})

		Context("when the path is a file", func() {
			const file = "test.txt"

			BeforeEach(func() {
				Expect(fsys.Create(file)).NotTo(BeNil())
			})

			It("should fail", func() {
				app, err := app.Load(fsys, file)

				Expect(app).To(BeNil())
				Expect(err).To(HaveOccurred())
			})

			Context("and path is absolute", func() {
				It("should fail", func() {
					path, err := filepath.Abs(file)
					Expect(err).NotTo(HaveOccurred())

					app, err := app.Load(fsys, path)

					Expect(app).To(BeNil())
					Expect(err).To(HaveOccurred())
				})
			})
		})

		Context("when the path is a directory", func() {
			const dir = "test"

			BeforeEach(func() {
				Expect(fsys.Mkdir(dir, os.ModeDir)).To(Succeed())
			})

			It("should succeed", func() {
				app, err := app.Load(fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app).NotTo(BeNil())
			})

			It("should have a workspace", func() {
				app, err := app.Load(fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace()).NotTo(BeNil())
			})

			It("should have a filesystem", func() {
				app, err := app.Load(fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).NotTo(BeNil())
			})

			It("should not use the given filesystem", func() {
				app, err := app.Load(fsys, dir)

				Expect(err).NotTo(HaveOccurred())
				Expect(app.Workspace().Fs()).NotTo(BeIdenticalTo(fsys))
			})

			Context("and directory is absolute", func() {
				It("should fail", func() {
					path, err := filepath.Abs(dir)
					Expect(err).NotTo(HaveOccurred())

					app, err := app.Load(fsys, path)

					Expect(app).To(BeNil())
					Expect(err).To(HaveOccurred())
				})
			})
		})
	})
})
