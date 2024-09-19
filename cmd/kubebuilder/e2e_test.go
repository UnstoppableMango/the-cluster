package main_test

import (
	"os"
	"path"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"sigs.k8s.io/kubebuilder/v4/pkg/plugin/util"
	"sigs.k8s.io/kubebuilder/v4/test/e2e/utils"
)

var _ = FDescribe("E2E", func() {
	var (
		kbc  *utils.TestContext
		work string
	)

	BeforeEach(func() {
		var err error

		By("creating a temporary directory")
		work, err = os.MkdirTemp("", "")
		Expect(err).NotTo(HaveOccurred())

		kubeconfigPath := path.Join(work, "kubeconfig")
		GinkgoWriter.Write(kubeconfig)

		By("writing the kubeconfig to " + kubeconfigPath)
		err = os.WriteFile(kubeconfigPath, []byte{}, os.ModePerm)
		Expect(err).NotTo(HaveOccurred())

		By("creating a kubebuilder test context")
		kbc, err = utils.NewTestContext(util.KubebuilderBinName,
			"GO111MODULE=on",
			"KUBECONFIG="+kubeconfigPath,
		)
		Expect(err).NotTo(HaveOccurred())

		By("preparing the test context")
		Expect(kbc.Prepare()).To(Succeed())
	})

	AfterEach(func() {
		Expect(os.RemoveAll(work)).To(Succeed())
	})

	It("should work", func() {
		Expect(true).To(BeTrue())
	})
})
