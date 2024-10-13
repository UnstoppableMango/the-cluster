package app_test

import (
	"os"

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
			BeforeEach(func() {
				Expect(fsys.Create("test")).NotTo(BeNil())
			})

			It("should fail", func() {
				app, err := app.Load(fsys, "test")

				Expect(app).To(BeNil())
				Expect(err).To(HaveOccurred())
			})
		})

		Context("when the path is a directory", func() {
			BeforeEach(func() {
				Expect(fsys.Mkdir("test", os.ModeDir)).To(Succeed())
			})

			It("should succeed", func() {
				app, err := app.Load(fsys, "test")

				Expect(err).NotTo(HaveOccurred())
				Expect(app).NotTo(BeNil())
			})
		})
	})
})
