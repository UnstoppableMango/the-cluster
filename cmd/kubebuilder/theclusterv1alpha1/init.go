package theclusterv1alpha1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	golangv4 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

type initSubcommand struct {
	// config config.Config

	// // boilerplate options
	// license string
	// owner   string

	golangv4.Plugin
}

// Scaffold implements plugin.InitSubcommand.
func (i *initSubcommand) Scaffold(fs machinery.Filesystem) error {
	// c := i.golang.GetInitSubcommand()
	// err := c.Scaffold(fs)

	return nil
}

var _ plugin.InitSubcommand = &initSubcommand{}
