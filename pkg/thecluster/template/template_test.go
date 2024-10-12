package template_test

import (
	"os"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unmango/go/slices"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
)

var _ = Describe("Template", func() {
	var (
		srcFs thecluster.Fs
	)

	BeforeEach(func() {
		srcFs = afero.NewMemMapFs()
	})

	It("should use the name of the provided directory", func() {
		g := template.New(srcFs, "test-template")

		Expect(g.Name()).To(Equal("test-template"))
	})

	DescribeTable("files",
		Entry("should list single", []string{"test-template/test.txt"}, 1),
		Entry("should list multiple", []string{"test-template/test.txt", "test-template/test.ts"}, 2),
		Entry("should list in a dir", []string{"test-template/test.txt", "test-template/dir/test.ts"}, 2),
		func(paths []string, expectedLen int) {
			Expect(srcFs.Mkdir("test-template", os.ModeDir)).To(Succeed())
			Expect(srcFs.Mkdir("test-template/dir", os.ModeDir)).To(Succeed())
			for _, p := range paths {
				Expect(srcFs.Create(p)).NotTo(BeNil())
			}
			g := template.New(srcFs, "test-template")

			templates := g.Files()

			s := slices.Collect(templates)
			Expect(s).To(HaveLen(expectedLen))
		},
	)
})
