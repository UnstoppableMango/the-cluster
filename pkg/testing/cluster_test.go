package testing_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"sigs.k8s.io/kind/pkg/cluster"

	"github.com/unstoppablemango/the-cluster/pkg/testing"
)

var _ = Describe("Cluster", func() {
	Context("NewCluster", func() {
		It("should create a cluster", func() {
			c := testing.NewCluster()

			Expect(c).NotTo(BeNil())
			Expect(c.Kind).NotTo(Equal(cluster.Provider{}))
		})
	})

	Context("DefaultOptions", func() {
		It("should create a random name", func() {
			opts := testing.DefaultOptions()

			Expect(opts.Name).To(ContainSubstring(testing.DefaultName))
			longerName := len(opts.Name) > len(testing.DefaultName)
			Expect(longerName).To(BeTrueBecause("the generated name has a random suffix at the end"))
		})
	})

	setup := func() *testing.Cluster {
		return testing.NewCluster(
			testing.WriteTo(GinkgoWriter),
		)
	}

	BeforeEach(func() {
		By("ensuring the environment is clean")
		Expect(setup().Stop()).To(Succeed())
	})

	It("should set up and tear down", Label("E2E"), func() {
		c := setup()

		Expect(c.Start()).To(Succeed())
		Expect(c.Stop()).To(Succeed())
	})
})
