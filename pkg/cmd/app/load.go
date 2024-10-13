package app

import (
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var LoadCmd = &cobra.Command{
	Use:     "load",
	Short:   "Ensure an app is able to load",
	Aliases: []string{"l", "lo"},
	Args:    cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ctx, path := cmd.Context(), args[0]
		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Errorf("loading local git workspace: %s", err)
			os.Exit(1)
		}

		app, err := app.Load(ctx, ws.Fs(), path)
		if err != nil {
			log.Errorf("loading app: %s", err)
			os.Exit(1)
		}

		fmt.Println(app.Name())
	},
}
