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

		work, err = os.MkdirTemp("", "")
		Expect(err).NotTo(HaveOccurred())

		kubeconfigPath := path.Join(work, "kubeconfig")

		By("writing " + kubeconfigPath)
		err = os.WriteFile(kubeconfigPath, kubeconfig, os.ModePerm)
		Expect(err).NotTo(HaveOccurred())

		By("creating a kubebuilder test context")
		kbc, err = utils.NewTestContext(kbutil.KubebuilderBinName,
			"KUBECONFIG="+kubeconfigPath,
		)
		Expect(err).NotTo(HaveOccurred())

		gitroot, err := util.GitRoot()
		Expect(err).NotTo(HaveOccurred())

		save := os.Getenv("PATH")
		err = os.Setenv("PATH", path.Join(gitroot, "bin"))
		Expect(err).NotTo(HaveOccurred())

		By("preparing the test context")
		Expect(kbc.Prepare()).To(Succeed())

		err = os.Setenv("PATH", save)
		Expect(err).NotTo(HaveOccurred())
	})

	AfterEach(func() {
		kbc.Destroy()
		Expect(os.RemoveAll(work)).To(Succeed())
	})

	Context("init", func() {
		It("should not touch my Makefile dammit", func() {
			content := "some text here"
			write(kbc, "Makefile", content)

			_ = kbc.Init()

			result, err := read(kbc, "Makefile")
			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(content))
		})

		It("should create the PROJECT file", func() {
			Expect(kbc.Init()).To(Succeed())

			_, err := read(kbc, "PROJECT")
			Expect(err).NotTo(HaveOccurred())
		})
	})
})

func write(ctx *utils.TestContext, file, content string) error {
	file = path.Join(ctx.Dir, file)
	return os.WriteFile(file, []byte(content), os.ModePerm)
}

func read(ctx *utils.TestContext, file string) (string, error) {
	file = path.Join(ctx.Dir, file)
	c, err := os.ReadFile(file)
	return string(c), err
}
