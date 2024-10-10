package template_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
)

var _ = Describe("File", func() {
	Context("Execute", func() {
		It("should work", func() {
			f := template.NewFile("TODO", nil)
			fs := afero.NewMemMapFs()

			Expect(f.Execute(fs, nil)).To(Succeed())
		})
	})
})
