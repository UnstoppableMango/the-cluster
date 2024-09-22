package utils

import (
	"context"
	"fmt"

	"github.com/testcontainers/testcontainers-go/modules/k3s"
)

const (
	defaultK3sVersion = "1.31.0-k3s1"
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
	if err != nil {
		return err
	}

	c.k3s.ctr = ctr
	return nil
}
