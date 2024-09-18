package main

import (
	"fmt"
	"os"

	"github.com/unstoppablemango/the-cluster/cmd/kubebuilder/theclusterv1"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang"
)

func main() {
	thebundlev1, _ := plugin.NewBundleWithOptions(
		plugin.WithName(golang.DefaultNameQualifier),
		plugin.WithVersion(plugin.Version{Number: 4}),
		plugin.WithPlugins(theclusterv1.Plugin{}),
	)

	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithPlugins(thebundlev1),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building CLI: %v", err)
		os.Exit(1)
	}

	if err := c.Run(); err != nil {
		os.Exit(1)
	}
}
