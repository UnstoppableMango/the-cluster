package e2e

import (
	"context"
	"os"
	"path"
	"testing"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/test/utils"
)

var (
	cluster    = utils.NewTestCluster()
	kubeconfig []byte
)

func TestE2E(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "e2e suite", Label("E2E"))
}

var _ = BeforeSuite(func(ctx context.Context) {
	var (
		cancel context.CancelFunc
		err    error
	)

	ctx, cancel = context.WithDeadline(ctx, time.Now().Add(3*time.Minute))
	defer cancel()

	By("running k3s in docker")
	Expect(cluster.Start(ctx)).To(Succeed())

	By("retrieving the kubeconfig from k3s")
	kubeconfig, err = cluster.GetKubeConfig(ctx)
	Expect(err).NotTo(HaveOccurred())

	By("creating a temporary directory")
	tmp, err := os.MkdirTemp("", "")
	Expect(err).NotTo(HaveOccurred())

	p := path.Join(tmp, "kubeconfig")
	Expect(os.WriteFile(p, kubeconfig, os.ModePerm)).To(Succeed())
	Expect(os.Setenv("KUBECONFIG", p)).To(Succeed())
})

var _ = AfterSuite(func(ctx context.Context) {
	By("stopping the cluster")
	Expect(cluster.Stop(ctx)).To(Succeed())
	Expect(os.Unsetenv("KUBECONFIG")).To(Succeed())
})
