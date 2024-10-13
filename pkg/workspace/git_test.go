package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Git", func() {
	It("should return the provided fs", func() {
		w := &workspace.LocalGitWorkspace{}

		Expect(w.Fs()).To(BeNil())
	})

	Context("NewLocalGit", func() {
		It("should not fail with default options", func() {
			w, err := workspace.NewLocalGit()

			Expect(err).NotTo(HaveOccurred())
			Expect(w).NotTo(BeNil())
		})

		It("should use the local git fs", func() {
			w, err := workspace.NewLocalGit()

			Expect(err).NotTo(HaveOccurred())
			actual := w.Fs()
			Expect(actual).NotTo(BeNil())
			localRepo, ok := actual.(*fs.LocalRepoFs)
			Expect(ok).To(BeTrueBecause("the fs is a LocalRepoFs"))

			root, err := util.GitRoot()
			Expect(err).NotTo(HaveOccurred())
			Expect(localRepo.Root).To(Equal(root))
		})
	})
})
