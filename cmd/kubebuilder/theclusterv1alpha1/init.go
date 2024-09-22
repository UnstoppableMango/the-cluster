package theclusterv1alpha1

import (
	"github.com/spf13/pflag"
	"github.com/unstoppablemango/the-cluster/cmd/kubebuilder/theclusterv1alpha1/scaffolds"
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
)

const (
	repo = "github.com/unstoppablemango/the-cluster"
)

type initSubcommand struct {
	config config.Config

	domain string
	name   string
}

// BindFlags implements plugin.HasFlags.
func (i *initSubcommand) BindFlags(fs *pflag.FlagSet) {
	fs.StringVar(&i.domain, "domain", "thecluster.io", "domain for groups")
	fs.StringVar(&i.name, "project-name", "", "name of this project")
}

// InjectConfig implements plugin.RequiresConfig.
func (i *initSubcommand) InjectConfig(c config.Config) error {
	i.config = c

	if err := i.config.SetDomain(i.domain); err != nil {
		return err
	}
	if err := i.config.SetProjectName(i.name); err != nil {
		return err
	}
	if err := i.config.SetRepository(repo); err != nil {
		return err
	}

	return nil
}

// Scaffold implements plugin.InitSubcommand.
func (i *initSubcommand) Scaffold(fs machinery.Filesystem) error {
	init := scaffolds.NewInitScaffolder(i.config)
	init.InjectFS(fs)
	return init.Scaffold()
}

var _ plugin.InitSubcommand = &initSubcommand{}
var _ plugin.HasFlags = &initSubcommand{}
var _ plugin.RequiresConfig = &initSubcommand{}
