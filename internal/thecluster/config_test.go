package thecluster_test

import (
	"os"
	"testing/quick"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/thecluster"
)

var _ = Describe("Config", func() {
	AfterEach(func() {
		os.Unsetenv("CI")
	})

	It("should not be CI", func() {
		os.Unsetenv("CI")

		actual := thecluster.NewConfig("")

		Expect(actual.CI).To(BeFalse())
	})

	DescribeTable("should read CI env",
		Entry("boolean", "true"),
		Entry("number", "1"),
		Entry("random text", "literally anything"),
		func(value string) {
			os.Setenv("CI", value)

			actual := thecluster.NewConfig("")

			Expect(actual.CI).To(BeTrue())
		},
	)

	It("should set root", func() {
		f := func(x string) bool {
			actual := thecluster.NewConfig(x)
			return actual.Root == x
		}

		Expect(quick.Check(f, nil)).To(Succeed())
	})

	It("should initialize root modules", func() {
		actual := thecluster.NewConfig("")

		Expect(actual.RootModules).To(BeEmpty())
	})

	It("should default to uninteractive", func() {
		actual := thecluster.NewConfig("")

		Expect(actual.Interactive).To(BeFalse())
	})
})
