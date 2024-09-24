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

		gitRoot, err := util.GitRoot()
		Expect(err).NotTo(HaveOccurred())

		localbin := path.Join(gitRoot, "bin")
		kubebuilder := path.Join(localbin, kbutil.KubebuilderBinName)

		By("creating a kubebuilder test context")
		kbc, err = utils.NewTestContext(kubebuilder,
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
		DescribeTableSubtree("allowed files",
			Entry(".dockerignore", ".dockerignore"),
			Entry(".editorconfig", ".editorconfig"),
			Entry(".golangci.yml", ".golangci.yml"),
			Entry("buf.gen.yaml", "buf.gen.yaml"),
			Entry("buf.lock", "buf.lock"),
			Entry("buf.yaml", "buf.yaml"),
			Entry("global.json", "global.json"),
			Entry("Makefile", "Makefile"),
			Entry("NuGet.Config", "NuGet.Config"),
			Entry("UnMango.TheCluster.sln", "UnMango.TheCluster.sln"),
			Entry("UnMango.TheCluster.sln.DotSettings", "UnMango.TheCluster.sln.DotSettings"),
			Entry("UnMango.TheCluster.sln.DotSettings.user", "UnMango.TheCluster.sln.DotSettings.user"),
			func(file string) {
				It("should succeed", func() {
					write(kbc, file, "Not applicable for this test")

					Expect(kbc.Init()).To(Succeed())
				})

				It("should not modify the file", func() {
					content := "some text here"
					write(kbc, file, content)

					_ = kbc.Init()

					result, err := read(kbc, file)
					Expect(err).NotTo(HaveOccurred())
					Expect(result).To(Equal(content))
				})
			},
		)

		DescribeTable("expect files",
			Entry("PROJECT", "PROJECT"),
			Entry("main.go", "cmd/operator/main.go"),
			Entry("generated.mk", "cmd/operator/generated.mk"),
			Entry("Dockerfile", "containers/operator/Dockerfile"),
			Entry(".dockerignore", "containers/operator/Dockerfile.dockerignore"),
			Entry("e2e_suite_test.go", "test/e2e/e2e_suite_test.go"),
			Entry("e2e_test.go", "test/e2e/operator_e2e_test.go"),
			Entry("utils.go", "test/utils/utils.go"),
			Entry("rbac/kustomization.yaml", "config/rbac/kustomization.yaml"),
			Entry("role.yaml", "config/rbac/role.yaml"),
			Entry("metrics_auth_role.yaml", "config/rbac/metrics_auth_role.yaml"),
			Entry("metrics_auth_role_binding.yaml", "config/rbac/metrics_auth_role_binding.yaml"),
			Entry("metrics_reader_role.yaml", "config/rbac/metrics_reader_role.yaml"),
			Entry("leader_election_role.yaml", "config/rbac/leader_election_role.yaml"),
			Entry("leader_election_role_binding.yaml", "config/rbac/leader_election_role_binding.yaml"),
			Entry("service_account.yaml", "config/rbac/service_account.yaml"),
			Entry("default/kustomization.yaml", "config/default/kustomization.yaml"),
			Entry("metrics_service.yaml", "config/default/metrics_service.yaml"),
			Entry("manager_metrics_patch.yaml", "config/default/manager_metrics_patch.yaml"),
			Entry("manager/kustomization.yaml", "config/manager/kustomization.yaml"),
			Entry("manager.yaml", "config/manager/manager.yaml"),
			Entry("network-policy/kustomization.yaml", "config/network-policy/kustomization.yaml"),
			Entry("allow-metrics-traffic.yaml", "config/network-policy/allow-metrics-traffic.yaml"),
			Entry("prometheus/kustomization.yaml", "config/prometheus/kustomization.yaml"),
			func(file string) {
				Expect(kbc.Init()).To(Succeed())

				_, err := read(kbc, file)
				Expect(err).NotTo(HaveOccurred())
			},
		)
	})

	Context("create api", func() {
		var (
			group, version, kind string

			mainPath string
		)

		BeforeEach(func() {
			group = "thecluster"
			version = "v1alpha1"
			kind = "TestResource"
			mainPath = path.Join(kbc.Dir, "cmd/operator/main.go")

			Expect(kbc.Init()).To(Succeed())
		})

		It("should update main.go", func() {
			err := kbc.CreateAPI(
				"--group", group,
				"--version", version,
				"--kind", kind,
			)

			Expect(err).NotTo(HaveOccurred())
			Expect(kbutil.HasFileContentWith(mainPath, "main")).To(BeTrue())
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
