package app

import (
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/app"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var InitCmd = &cobra.Command{
	Use:   "init [DIR]",
	Short: "Initialize an App in a directory",
	Long:  "Initializes a THECLUSTER App in the directory specified by [DIR]",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()
		log := log.FromContext(ctx)

		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Error("unable to initialize workspace", "err", err)
			os.Exit(1)
		}

		if _, err := app.Init(ws, args[0]); err != nil {
			log.Error("unable to initalize app", "err", err)
			os.Exit(1)
		}
	},
}
