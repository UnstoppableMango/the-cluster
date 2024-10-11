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
			path     string
			file     afero.File
			srcFs    thecluster.Fs
			targetFs thecluster.Fs
		)

		BeforeEach(func() {
			var err error

			path = "test.txt"
			srcFs = afero.NewMemMapFs()
			targetFs = afero.NewMemMapFs()

			file, err = srcFs.Create(path)
			Expect(err).NotTo(HaveOccurred())
		})

		It("should work", func() {
			f := template.NewFile(srcFs, path)

			Expect(f.Execute(targetFs, nil)).To(Succeed())
		})

		It("should template a string value", func() {
			tmpl := "Some {{.Text}}"
			data := struct{ Text string }{Text: "thing"}
			written, err := file.Write([]byte(tmpl))
			Expect(err).NotTo(HaveOccurred())
			Expect(written).NotTo(Equal(0))

			f := template.NewFile(srcFs, path)
			Expect(f.Execute(targetFs, data)).To(Succeed())

			Expect(afero.Exists(targetFs, path)).To(BeTrueBecause("the file exists in the target fs"))
			Expect(afero.FileContainsBytes(targetFs, path, []byte("Some thing"))).To(BeTrueBecause("the template executed"))
		})
	})
})
