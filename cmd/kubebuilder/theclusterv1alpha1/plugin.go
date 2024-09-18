package theclusterv1alpha1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	golang "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

type Plugin struct {
	golang.Plugin
}

var _ plugin.Full = Plugin{}
