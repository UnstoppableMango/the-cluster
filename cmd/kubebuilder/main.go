package main

import (
	"fmt"
	"os"

	tcv1alpha1 "github.com/unstoppablemango/the-cluster/cmd/kubebuilder/theclusterv1alpha1"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	cfgv3 "sigs.k8s.io/kubebuilder/v4/pkg/config/v3"
)

func main() {
	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithPlugins(tcv1alpha1.Plugin{}),
		cli.WithDefaultPlugins(cfgv3.Version, tcv1alpha1.Plugin{}),
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
