package cmd

import (
	"github.com/spf13/cobra"
	"sigs.k8s.io/kubebuilder/v4/pkg/cli"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	kustomizecommonv2 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/common/kustomize/v2"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang"
	golangv4 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

var kubebuilderCmd = &cobra.Command{
	Use:     "kubebuilder",
	Aliases: []string{"kb"},
	RunE: func(cmd *cobra.Command, args []string) error {
		return nil
	},
}

func init() {
	rootCmd.AddCommand(kubebuilderCmd)
}

func getCli() (*cli.CLI, error) {
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
		return nil, err
	}

	return c, nil
}
