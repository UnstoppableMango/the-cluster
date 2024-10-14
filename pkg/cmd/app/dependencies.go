package app

import (
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/cmd/app/dependencies"
)

var DependenciesCmd = &cobra.Command{
	Use:     "dependencies",
	Short:   "Manage App dependencies",
	Aliases: []string{"deps", "dep", "d"},
}

func AddDependenciesSubcommands(cmd *cobra.Command) {
	cmd.AddCommand(dependencies.InstallCmd)
}
