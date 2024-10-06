package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Discover", func() {
	It("should group by the first relative path segment", func() {
		ws, err := workspace.NewLocalGit()

		Expect(err).NotTo(HaveOccurred())
		var i int
		for _ = range template.Discover(ws, "templates") {
			i = i + 1
		}
		Expect(i).To(Equal(1))
	})
})
