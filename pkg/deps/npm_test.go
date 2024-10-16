package deps_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/deps"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Npm", func() {
	Context("IsNpm", func() {
		var fsys thecluster.Fs

		BeforeEach(func() {
			fsys = afero.NewMemMapFs()
		})

		It("should not be an npm workspace", func() {
			ws := workspace.At(fsys, "")

			Expect(deps.IsNpm(ws)).To(BeFalseBecause("the workspace contains no npm files"))
		})

		Context("when a package-lock.json file exists in the workspace", func() {
			BeforeEach(func() {
				Expect(fsys.Create("package-lock.json")).NotTo(BeNil())
			})

			It("should be an npm workspace", func() {
				ws := workspace.At(fsys, "")

				Expect(deps.IsNpm(ws)).To(BeTrueBecause("the workspace contains npm files"))
			})
		})
	})
})
