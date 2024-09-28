package github_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/vcs/github"
)

var _ = Describe("Provider", func() {
	Context("New", func() {
		It("should create a new GitHub source control provider", func() {
			p := github.New()

			Expect(p).NotTo(BeNil())
		})
	})
})
