package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
)

var _ = Describe("File", func() {
	Context("Execute", func() {
		var (
			path   string
			mockFs thecluster.Fs
		)

		BeforeEach(func() {
			path = "test.txt"
			mockFs = afero.NewMemMapFs()
			Expect(mockFs.Create(path)).NotTo(BeNil())
		})

		It("should work", func() {
			file, err := mockFs.Open(path)
			Expect(err).NotTo(HaveOccurred())

			f := template.NewFile(path, file)
			fs := afero.NewMemMapFs()

			Expect(f.Execute(fs, nil)).To(Succeed())
		})
	})
})
