package main_test

import (
	"context"
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

func TestKubebuilder(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Kubebuilder Suite")
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
})

var _ = AfterSuite(func(ctx context.Context) {
	By("stopping the cluster")
	Expect(cluster.Stop(ctx)).To(Succeed())
})
