package theclusterv1alpha1

import (
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
)

type Options struct {
	Plural       string
	Namespaced   bool
	DoDefaulting bool
	DoValidation bool
	DoConversion bool
}

func (opts Options) UpdateResource(res *resource.Resource, c config.Config) {
	if opts.Plural != "" {
		res.Plural = opts.Plural
	}
}
