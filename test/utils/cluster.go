package utils

import (
	"context"
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/k3s"
)

const (
	defaultK3sVersion = "1.31.0-k3s1"
)

var (
	defaultDeadline = 1 * time.Minute
)

type cluster interface {
	Start(context.Context) error
	Stop(context.Context) error
	Kubeconfig(context.Context) ([]byte, error)
	Version() string
	withLoggers([]io.Writer)
}

type dockerCluster interface {
	Image() string
}

type k3sCluster struct {
	ctr          *k3s.K3sContainer
	logConsumers []testcontainers.LogConsumer
	version      string
}

// Kubeconfig implements cluster.
func (c *k3sCluster) Kubeconfig(ctx context.Context) ([]byte, error) {
	if c.ctr == nil {
		return nil, errors.New("cluster has not been initialized")
	}

	return c.ctr.GetKubeConfig(ctx)
}

// Start implements cluster.
func (c *k3sCluster) Start(ctx context.Context) error {
	ctr, err := k3s.Run(ctx, c.Image(),
		testcontainers.WithLogConsumers(c.logConsumers...),
	)
	if err != nil {
		return err
	}

	c.ctr = ctr
	return nil
}

// Stop implements cluster.
func (c *k3sCluster) Stop(ctx context.Context) error {
	if c.ctr == nil {
		return errors.New("cluster has not been initialized")
	}

	return c.ctr.Stop(ctx, &defaultDeadline)
}

// Version implements cluster.
func (c *k3sCluster) Version() string {
	return c.version
}

func (c *k3sCluster) withLoggers(loggers []io.Writer) {
	c.logConsumers = logAdapters(loggers)
}

func (c k3sCluster) Image() string {
	return fmt.Sprintf("docker.io/rancher/k3s:v%s", c.version)
}

var _ cluster = &k3sCluster{}

type TestCluster struct {
	backend cluster
	loggers []io.Writer
}

type TestClusterOption func(*TestCluster)

func NewTestCluster(opts ...TestClusterOption) *TestCluster {
	k := &k3sCluster{version: defaultK3sVersion}
	c := &TestCluster{k, []io.Writer{}}
	for _, configure := range opts {
		configure(c)
	}

	return c
}

func (c *TestCluster) Start(ctx context.Context) error {
	return c.backend.Start(ctx)
}

func (c *TestCluster) Stop(ctx context.Context) error {
	return c.backend.Stop(ctx)
}

func (c *TestCluster) GetKubeConfig(ctx context.Context) ([]byte, error) {
	return c.backend.Kubeconfig(ctx)
}

func (c TestCluster) Image() string {
	if d, ok := c.backend.(dockerCluster); ok {
		return d.Image()
	}

	return ""
}

func (c TestCluster) Version() string {
	return c.backend.Version()
}

func (c TestCluster) logAdapters() []testcontainers.LogConsumer {
	return logAdapters(c.loggers)
}

// Deprecated: Use WithK3s instead
func WithK3sVersion(version string) TestClusterOption {
	return func(tc *TestCluster) {
		if k, ok := tc.backend.(*k3sCluster); ok {
			k.version = version
		}
	}
}

func WithK3s(version string) TestClusterOption {
	return func(tc *TestCluster) {
		tc.backend = &k3sCluster{nil, tc.logAdapters(), version}
	}
}

func WithLoggers(loggers ...io.Writer) TestClusterOption {
	return func(tc *TestCluster) {
		tc.loggers = loggers
		tc.backend.withLoggers(loggers)
	}
}

type logAdapter struct {
	w io.Writer
}

// Accept implements testcontainers.LogConsumer.
func (l *logAdapter) Accept(msg testcontainers.Log) {
	_, _ = l.w.Write(msg.Content)
}

var _ testcontainers.LogConsumer = &logAdapter{}

func logAdapters(loggers []io.Writer) []testcontainers.LogConsumer {
	adapters := make([]testcontainers.LogConsumer, len(loggers))
	for i, l := range loggers {
		adapters[i] = &logAdapter{l}
	}

	return adapters
}
