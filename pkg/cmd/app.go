package cmd

import (
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/cmd/app"
)

var AppCmd = &cobra.Command{
	Use:   "app",
	Short: "Manage THECLUSTER Apps",
}

func AddAppSubcommands(cmd *cobra.Command) {
	// This feels wrong
	deps := *app.DependenciesCmd
	app.AddDependenciesSubcommands(&deps)

	cmd.AddCommand(
		app.InitCmd,
		app.LoadCmd,
		&deps,
	)
}
