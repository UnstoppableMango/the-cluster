package main

import (
	"fmt"
	"os"

	theclusterv1 "github.com/unstoppablemango/the-cluster/cmd/kubebuilder/theclusterv1alpha1"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
)

func main() {
	// thebundlev1, _ := plugin.NewBundleWithOptions(
	// 	plugin.WithName(golang.DefaultNameQualifier),
	// 	plugin.WithVersion(plugin.Version{Number: 4}),
	// 	plugin.WithPlugins(theclusterv1.Plugin{}),
	// )

	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithPlugins(theclusterv1.Plugin{}),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building CLI: %v", err)
		os.Exit(1)
	}

	if err := c.Run(); err != nil {
		os.Exit(1)
	}
}
