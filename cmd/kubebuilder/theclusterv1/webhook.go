package theclusterv1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
)

type createWebhookSubcommand struct{}

// InjectResource implements plugin.CreateWebhookSubcommand.
func (c *createWebhookSubcommand) InjectResource(*resource.Resource) error {
	panic("unimplemented")
}

// Scaffold implements plugin.CreateWebhookSubcommand.
func (c *createWebhookSubcommand) Scaffold(machinery.Filesystem) error {
	panic("unimplemented")
}

var _ plugin.CreateWebhookSubcommand = &createWebhookSubcommand{}
