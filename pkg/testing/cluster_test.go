package testing_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/testing"
)

var _ = Describe("Cluster", func() {
	Context("NewCluster", func() {
		It("should create a cluster", func() {
			c := testing.NewCluster()

			Expect(c).NotTo(BeNil())
			Expect(c.Provider).NotTo(BeNil())
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
