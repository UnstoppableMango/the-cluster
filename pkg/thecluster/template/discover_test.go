package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/seq"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Discover", func() {
	var ws thecluster.Workspace

	BeforeEach(func() {
		var err error
		ws, err = workspace.NewLocalGit()
		Expect(err).NotTo(HaveOccurred())
	})

	It("should discover local pulumi templates", func() {
		s := seq.ToSlice(template.Discover(ws, "templates"))

		Expect(s).To(HaveLen(1))
		g, err := s[0].Unwrap()
		Expect(err).NotTo(HaveOccurred())
		Expect(g.Name()).To(Equal("pulumi"))
	})

	It("should discover the typescript template", func() {
		s := seq.ToSlice(template.Discover(ws, "templates"))

		Expect(s).To(HaveLen(1))
		g, err := s[0].Unwrap()
		Expect(err).NotTo(HaveOccurred())
		templates := seq.ToSlice(g.Templates())
		Expect(templates).To(HaveLen(1))
	})
})
