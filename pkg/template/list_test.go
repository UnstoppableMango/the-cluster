package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unmango/go/slices"

	"github.com/unstoppablemango/the-cluster/pkg/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("List", func() {
	var ws thecluster.Workspace

	BeforeEach(func() {
		var err error
		ws, err = workspace.NewLocalGit()
		Expect(err).NotTo(HaveOccurred())
	})

	It("should discover local pulumi templates", func() {
		ts := slices.Collect(template.List(ws.Fs()))

		Expect(ts).To(HaveLen(1))
		Expect(ts[0].Name()).To(Equal("pulumi"))
	})

	It("should discover the typescript template", func() {
		ts := slices.Collect(template.List(ws.Fs()))

		Expect(ts).To(HaveLen(1))
		t, err := ts[0].Templates()
		Expect(err).NotTo(HaveOccurred())
		templates := slices.Collect(t)
		Expect(templates).To(HaveLen(1))
		Expect(templates[0].Name()).To(Equal("typescript"))
	})

	It("should discover the index.ts file", func() {
		ts := slices.Collect(template.List(ws.Fs()))

		Expect(ts).To(HaveLen(1))
		t, err := ts[0].Templates()
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

	// I think I'll want the mock fs to make this easier
	It("should ignore errored templates", Pending, func() {
		fs := afero.NewMemMapFs()

		ts := template.List(fs, template.WithPath(""))

		Expect(slices.Collect(ts)).To(HaveLen(0))
	})
})
