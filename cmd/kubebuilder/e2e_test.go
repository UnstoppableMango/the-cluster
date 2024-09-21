package main_test

import (
	"os"
	"path"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/internal/util"
	kbutil "sigs.k8s.io/kubebuilder/v4/pkg/plugin/util"
	"sigs.k8s.io/kubebuilder/v4/test/e2e/utils"
)

var _ = Describe("E2E", func() {
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

		By("writing the kubeconfig to " + kubeconfigPath)
		err = os.WriteFile(kubeconfigPath, kubeconfig, os.ModePerm)
		Expect(err).NotTo(HaveOccurred())

		gitroot, err := util.GitRoot()
		Expect(err).NotTo(HaveOccurred())

		err = os.Setenv("PATH", path.Join(gitroot, "bin"))
		Expect(err).NotTo(HaveOccurred())

		By("creating a kubebuilder test context")
		kbc, err = utils.NewTestContext(kbutil.KubebuilderBinName,
			"KUBECONFIG="+kubeconfigPath,
		)
		Expect(err).NotTo(HaveOccurred())

		By("preparing the test context")
		Expect(kbc.Prepare()).To(Succeed())
	})

	AfterEach(func() {
		kbc.Destroy()
		Expect(os.RemoveAll(work)).To(Succeed())
	})

	It("should work", func() {
		Expect(true).To(BeTrue())
	})
})
