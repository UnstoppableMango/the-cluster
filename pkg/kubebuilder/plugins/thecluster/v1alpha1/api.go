package theclusterv1alpha1

import (
	"github.com/spf13/pflag"
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
)

type createAPISubcommand struct {
	config   config.Config
	resource *resource.Resource
}

// BindFlags implements plugin.HasFlags.
func (c *createAPISubcommand) BindFlags(fs *pflag.FlagSet) {
	panic("unimplemented")
}

// InjectConfig implements plugin.RequiresConfig.
func (c *createAPISubcommand) InjectConfig(config config.Config) error {
	c.config = config
	return nil
}

// InjectResource implements plugin.CreateAPISubcommand.
func (c *createAPISubcommand) InjectResource(r *resource.Resource) error {
	c.resource = r
	if err := c.resource.Validate(); err != nil {
		return err
	}

	return nil
}

// Scaffold implements plugin.CreateAPISubcommand.
func (c *createAPISubcommand) Scaffold(machinery.Filesystem) error {
	panic("unimplemented")
}

var _ plugin.CreateAPISubcommand = &createAPISubcommand{}
var _ plugin.HasFlags = &createAPISubcommand{}
var _ plugin.RequiresConfig = &createAPISubcommand{}
