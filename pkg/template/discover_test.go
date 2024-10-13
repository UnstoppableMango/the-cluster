package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unmango/go/slices"
	"github.com/unstoppablemango/the-cluster/pkg/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Discover", func() {
	var ws thecluster.Workspace

	BeforeEach(func() {
		var err error
		ws, err = workspace.NewLocalGit()
		Expect(err).NotTo(HaveOccurred())
	})

	It("should discover local pulumi templates", func() {
		s := slices.Collect(template.Discover(ws.Fs()))

		Expect(s).To(HaveLen(1))
		g, err := s[0].Unwrap()
		Expect(err).NotTo(HaveOccurred())
		Expect(g.Name()).To(Equal("pulumi"))
	})

	It("should discover the typescript template", func() {
		s := slices.Collect(template.Discover(ws.Fs()))

		Expect(s).To(HaveLen(1))
		g, err := s[0].Unwrap()
		Expect(err).NotTo(HaveOccurred())
		t, err := g.Templates()
		Expect(err).NotTo(HaveOccurred())
		templates := slices.Collect(t)
		Expect(templates).To(HaveLen(1))
		Expect(templates[0].Name()).To(Equal("typescript"))
	})

	It("should discover the index.ts file", func() {
		s := slices.Collect(template.Discover(ws.Fs()))

		Expect(s).To(HaveLen(1))
		g, err := s[0].Unwrap()
		Expect(err).NotTo(HaveOccurred())
		t, err := g.Templates()
		Expect(err).NotTo(HaveOccurred())
		templates := slices.Collect(t)
		Expect(templates).To(HaveLen(1))
		files := slices.Collect(templates[0].Files())
		Expect(len(files) >= 1).To(BeTrueBecause("there is at least one template"))
		names := make([]string, len(files))
		for i, f := range files {
			names[i] = f.Name()
		}
		Expect(names).To(ContainElement("index.ts"))
	})
})
