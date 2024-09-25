package testing

import (
	"io"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/internal/log/adapters"
	"github.com/unstoppablemango/the-cluster/internal/util"
	"sigs.k8s.io/kind/pkg/cluster"
)

const (
	DefaultName           = "thetester"
	DefaultKubeconfigPath = ".kube/config"
)

type Options struct {
	logger         *log.Logger
	KubeconfigPath string
}

type Option func(*Options)

func (o Option) apply(opts *Options) {
	o(opts)
}

type Cluster struct {
	cluster.Provider
	Options
}

func NewCluster(options ...Option) *Cluster {
	opts := Options{log.Default(), ""}
	for _, o := range options {
		o.apply(&opts)
	}

	provider := cluster.NewProvider(
		cluster.ProviderWithDocker(),
		cluster.ProviderWithLogger(
			adapters.CharmToKind(opts.logger),
		),
	)

	return &Cluster{
		Provider: *provider,
		Options:  opts,
	}
}

func (c *Cluster) CreateTestCluster() error {
	root, err := util.GitRoot()
	if err != nil {
		return err
	}

	path := filepath.Join(root, c.KubeconfigPath)

	return c.Create(DefaultName,
		cluster.CreateWithKubeconfigPath(path),
	)
}

func (c *Cluster) DeleteTestCluster() error {
	return c.Delete(DefaultName, c.KubeconfigPath)
}

func WithLogger(logger *log.Logger) Option {
	return func(o *Options) {
		o.logger = logger
	}
}

func WriteTo(logger io.Writer) Option {
	return func(o *Options) {
		o.logger = log.New(logger)
	}
}

func WithKubeconfigPath(path string) Option {
	return func(o *Options) {
		o.KubeconfigPath = path
	}
}
