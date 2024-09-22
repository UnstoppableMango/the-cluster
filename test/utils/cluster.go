package utils

import (
	"context"
	"fmt"
	"time"

	"github.com/testcontainers/testcontainers-go/modules/k3s"
)

const (
	defaultK3sVersion = "1.31.0-k3s1"
)

var (
	defaultDeadline = 1 * time.Minute
)

type k3sCluster struct {
	ctr     *k3s.K3sContainer
	version string
}

func (c k3sCluster) Image() string {
	return fmt.Sprintf("docker.io/rancher/k3s:v%s", c.version)
}

type TestCluster struct {
	k3s *k3sCluster
}

type TestClusterOption func(*TestCluster)

func NewTestCluster(opts ...TestClusterOption) *TestCluster {
	c := &TestCluster{&k3sCluster{nil, defaultK3sVersion}}
	for _, configure := range opts {
		configure(c)
	}

	return c
}

func (c *TestCluster) Start(ctx context.Context) error {
	ctr, err := k3s.Run(ctx, c.k3s.Image())
	// Turns out this is really spammy
	// testcontainers.WithLogConsumers(util.AcceptAll(GinkgoWriter)),
	if err != nil {
		return err
	}

	c.k3s.ctr = ctr
	return nil
}

func (c *TestCluster) Stop(ctx context.Context) error {
	if c.k3s.ctr == nil {
		return nil
	}

	return c.k3s.ctr.Stop(ctx, &defaultDeadline)
}

func (c *TestCluster) GetKubeConfig(ctx context.Context) ([]byte, error) {
	return c.k3s.ctr.GetKubeConfig(ctx)
}

func (c TestCluster) Image() string {
	return c.k3s.Image()
}

func (c TestCluster) Version() string {
	return c.k3s.version
}

func WithK3sVersion(version string) TestClusterOption {
	return func(tc *TestCluster) {
		tc.k3s.version = version
	}
}
