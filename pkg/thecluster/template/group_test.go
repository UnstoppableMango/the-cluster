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

var _ = Describe("Group", func() {
	var (
		srcFs thecluster.Fs
	)

	BeforeEach(func() {
		srcFs = afero.NewMemMapFs()
	})

	It("should use the name of the provided directory", func() {
		g := template.NewGroup(srcFs, "test-group")

		Expect(g.Name()).To(Equal("test-group"))
	})

	DescribeTable("templates",
		Entry("should list single", []string{"test-group/test-template"}, 1),
		Entry("should list multiple", []string{"test-group/test-template", "test-group/test-template-2"}, 2),
		func(paths []string, expectedLen int) {
			Expect(srcFs.Mkdir("test-group", os.ModeDir)).To(Succeed())
			for _, p := range paths {
				Expect(srcFs.Mkdir(p, os.ModeDir)).To(Succeed())
			}
			g := template.NewGroup(srcFs, "test-group")

			templates, err := g.Templates()

			Expect(err).NotTo(HaveOccurred())
			s := slices.Collect(templates)
			Expect(s).To(HaveLen(expectedLen))
		},
	)
})
