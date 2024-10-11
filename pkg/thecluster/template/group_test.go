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

	It("should use the name of the provided file", func() {
		g := template.NewGroup(srcFs, "test-group")

		Expect(g.Name()).To(Equal("test-group"))
	})

	It("should list files at the given path", func() {
		Expect(srcFs.Mkdir("test-group", os.ModeDir)).To(Succeed())
		Expect(srcFs.Create("test-group/test.txt")).NotTo(BeNil())
		g := template.NewGroup(srcFs, "test-group")

		templates, err := g.Templates()

		Expect(err).NotTo(HaveOccurred())
		s := slices.Collect(templates)
		Expect(s).To(HaveLen(1))
	})
})
