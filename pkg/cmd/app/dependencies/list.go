package dependencies

import (
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var ListCmd = &cobra.Command{
	Use:     "list",
	Short:   "List an App's dependencies",
	Aliases: []string{"l", "li"},
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

		deps, err := a.Dependencies()
		if err != nil {
			log.Error("listing app dependencies", "err", err)
			os.Exit(1)
		}

		for _ = range deps {
			fmt.Printf("found dep\n")
		}
	},
}
