package main_test

import (
	"context"
	"testing"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/testcontainers/testcontainers-go/modules/k3s"
)

var (
	ctr        *k3s.K3sContainer
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
	ctr, err = k3s.Run(ctx, "docker.io/rancher/k3s:v1.31.0-k3s1")
	Expect(err).NotTo(HaveOccurred())

	By("retrieving the kubeconfig from k3s")
	kubeconfig, err = ctr.GetKubeConfig(ctx)
	Expect(err).NotTo(HaveOccurred())
})

var _ = AfterSuite(func(ctx context.Context) {
	if ctr != nil {
		// TODO: Use terminate function when released https://github.com/testcontainers/testcontainers-go/pull/2738
		// testcontainers.TerminateContainer(ctr)
		Expect(ctr.Terminate(ctx)).To(Succeed())
	}
})
