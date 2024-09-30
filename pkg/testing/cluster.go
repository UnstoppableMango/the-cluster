package testing

import (
	"fmt"
	"io"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/internal/log/adapters"
	"github.com/unstoppablemango/the-cluster/internal/rand"
	"github.com/unstoppablemango/the-cluster/internal/util"
	"sigs.k8s.io/kind/pkg/cluster"
)

const (
	DefaultName           = "thetester"
	DefaultKubeconfigPath = ".kube/config"
)

type Options struct {
	logger         *log.Logger
	Name           string
	KubeconfigPath string
}

type Option func(*Options)

func (o Option) apply(opts *Options) {
	o(opts)
}

type Cluster struct {
	Options

	Kind cluster.Provider
}

func NewCluster(options ...Option) *Cluster {
	opts := DefaultOptions()
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
		Kind:    *provider,
		Options: opts,
	}
}

func (c *Cluster) Start() error {
	root, err := util.GitRoot()
	if err != nil {
		return err
	}

	if c.KubeconfigPath == "" {
		c.KubeconfigPath = DefaultKubeconfigPath
	}

	abs := filepath.Join(root, c.KubeconfigPath)
	return c.Kind.Create(DefaultName,
		cluster.CreateWithKubeconfigPath(abs),
	)
}

func (c *Cluster) Stop() error {
	return c.Kind.Delete(DefaultName, c.KubeconfigPath)
}

func DefaultOptions() Options {
	suffix := rand.Int31()

	return Options{
		logger: log.Default(),
		Name:   fmt.Sprintf("thetester-%d", suffix),
	}
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
