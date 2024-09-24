package main

import (
	"fmt"
	"os"

	tcv1alpha1 "github.com/unstoppablemango/the-cluster/pkg/kubebuilder/plugins/thecluster/v1alpha1"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	cfgv3 "sigs.k8s.io/kubebuilder/v4/pkg/config/v3"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	golang "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

func main() {
	defaultBundle, err := plugin.NewBundleWithOptions(
		plugin.WithPlugins(golang.Plugin{}),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building CLI: %v", err)
		os.Exit(1)
	}

	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithPlugins(tcv1alpha1.Plugin{}),
		cli.WithDefaultPlugins(cfgv3.Version, defaultBundle),
		cli.WithCompletion(),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building CLI: %v", err)
		os.Exit(1)
	}

	if err := c.Run(); err != nil {
		os.Exit(1)
	}
}
