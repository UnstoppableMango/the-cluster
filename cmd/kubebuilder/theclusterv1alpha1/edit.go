package theclusterv1alpha1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
)

type editSubcommand struct{}

// Scaffold implements plugin.EditSubcommand.
func (e *editSubcommand) Scaffold(machinery.Filesystem) error {
	panic("unimplemented")
}

var _ plugin.EditSubcommand = &editSubcommand{}
