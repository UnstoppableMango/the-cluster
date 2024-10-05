package workspace_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var _ = Describe("Fs", func() {
	Context("Root", func() {
		Context("when workspace is local git", func() {
			var ws thecluster.Workspace

			BeforeEach(func() {
				var err error
				ws, err = workspace.NewLocalGit()
				Expect(err).NotTo(HaveOccurred())
			})

			It("should retrieve the git root path", func(ctx context.Context) {
				root, err := workspace.Root(ctx, ws)

				Expect(err).NotTo(HaveOccurred())
				gitRoot, err := util.GitRoot()
				Expect(root).To(Equal(gitRoot))
			})
		})
	})
})
