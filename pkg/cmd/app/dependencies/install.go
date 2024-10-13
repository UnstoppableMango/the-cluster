package dependencies

import (
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var InstallCmd = &cobra.Command{
	Use:     "install",
	Short:   "Install App dependencies",
	Aliases: []string{"i"},
	Args:    cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ctx, path := cmd.Context(), args[0]
		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Error("create local git workspace", "err", err)
			os.Exit(1)
		}

		a, err := app.Load(ctx, ws.Fs(), path)
		if err != nil {
			log.Error("loading app", "err", err)
			os.Exit(1)
		}

		err = app.InstallDeps(ctx, a)
		if err != nil {
			log.Error("installing deps", "err", err)
			os.Exit(1)
		}
	},
}
