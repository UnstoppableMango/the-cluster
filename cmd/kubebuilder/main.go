package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	tcv1alpha1 "github.com/unstoppablemango/the-cluster/pkg/kubebuilder/plugins/thecluster/v1alpha1"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	cfgv3 "sigs.k8s.io/kubebuilder/v4/pkg/config/v3"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/stage"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	kustomizev2 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/common/kustomize/v2"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang"
	deployimagev1alpha1 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/deploy-image/v1alpha1"
	golangv4 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
	grafanav1alpha1 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/optional/grafana/v1alpha"
)

func main() {
	defaultBundle, err := plugin.NewBundleWithOptions(
		plugin.WithName(golang.DefaultNameQualifier),
		plugin.WithVersion(plugin.Version{Number: 1, Stage: stage.Alpha}),
		plugin.WithPlugins(golangv4.Plugin{}, kustomizev2.Plugin{}),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed building default plugin bundle: %v", err)
		os.Exit(1)
	}

	out, err := exec.Command("git", "rev-parse", "HEAD").Output()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed calculating version: %v", err)
		os.Exit(1)
	}
	hash := strings.TrimSpace(string(out))

	c, err := cli.New(
		cli.WithCommandName("kubebuilder"),
		cli.WithVersion(fmt.Sprintf("git+%s", hash)),
		cli.WithPlugins(
			defaultBundle,
			golangv4.Plugin{},
			kustomizev2.Plugin{},
			deployimagev1alpha1.Plugin{},
			grafanav1alpha1.Plugin{},
			tcv1alpha1.Plugin{},
		),
		cli.WithDefaultPlugins(cfgv3.Version, defaultBundle),
		cli.WithDefaultProjectVersion(cfgv3.Version),
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
