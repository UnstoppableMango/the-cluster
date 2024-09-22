package utils_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/test/utils"
)

var _ = Describe("Cluster", func() {
	It("should create a new TestCluster", func() {
		c := utils.NewTestCluster()

		Expect(c).NotTo(BeNil())
		Expect(c.Version()).To(Equal("1.31.0-k3s1"))
		Expect(c.Image()).To(Equal("docker.io/rancher/k3s:v1.31.0-k3s1"))
	})

	It("should set k3s version", func() {
		expectedVersion := "blah.blah.blah"
		expectedImage := "docker.io/rancher/k3s:vblah.blah.blah"

		c := utils.NewTestCluster(utils.WithK3sVersion(expectedVersion))

		Expect(c).NotTo(BeNil())
		Expect(c.Version()).To(Equal(expectedVersion))
		Expect(c.Image()).To(Equal(expectedImage))
	})

	Context("when the container has not been started", func() {
		var cluster *utils.TestCluster

		BeforeEach(func() {
			cluster = utils.NewTestCluster()
		})

		It("should stop successfully", func(ctx context.Context) {
			Expect(cluster.Stop(ctx)).To(Succeed())
		})
	})
})
