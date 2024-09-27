package main_test

import (
	"context"
	"testing"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	ttest "github.com/unstoppablemango/the-cluster/pkg/testing"
)

var (
	cluster ttest.Cluster
)

func TestKubebuilder(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Kubebuilder Suite", Label("E2E"))
}

var _ = BeforeSuite(func(ctx context.Context) {
	var cancel context.CancelFunc
	ctx, cancel = context.WithDeadline(ctx, time.Now().Add(3*time.Minute))
	defer cancel()

	cluster = *ttest.NewCluster(
		ttest.WriteTo(GinkgoWriter),
	)

	By("starting the test cluster")
	Expect(cluster.Start()).To(Succeed())
})

var _ = AfterSuite(func(ctx context.Context) {
	By("stopping the cluster")
	Expect(cluster.Stop()).To(Succeed())
})
