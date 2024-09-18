package theclusterv1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
)

type createAPISubcommand struct{}

// InjectResource implements plugin.CreateAPISubcommand.
func (c *createAPISubcommand) InjectResource(*resource.Resource) error {
	panic("unimplemented")
}

// Scaffold implements plugin.CreateAPISubcommand.
func (c *createAPISubcommand) Scaffold(machinery.Filesystem) error {
	panic("unimplemented")
}

var _ plugin.CreateAPISubcommand = &createAPISubcommand{}
