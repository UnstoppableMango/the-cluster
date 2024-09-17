package main

import (
	"fmt"
	"os"

	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	kustomizecommonv2 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/common/kustomize/v2"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang"
	golangv4 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

func main() {
	gov4Bundle, _ := plugin.NewBundleWithOptions(
		plugin.WithName(golang.DefaultNameQualifier),
		plugin.WithVersion(plugin.Version{Number: 4}),
		plugin.WithPlugins(kustomizecommonv2.Plugin{}, golangv4.Plugin{}),
	)

	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithPlugins(gov4Bundle),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building CLI: %v", err)
		os.Exit(1)
	}

	if err := c.Run(); err != nil {
		os.Exit(1)
	}
}
