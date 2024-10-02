package app

import (
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/app"
)

var InitCmd = &cobra.Command{
	Use:   "init [DIR]",
	Short: "Initialize an App in a directory",
	Long:  "Initializes a THECLUSTER App in the directory specified by [DIR]",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()
		log := log.FromContext(ctx)

		repo, err := fs.LocalRepo()
		if err != nil {
			log.Error("unable to initialize repo fs", "err", err)
			os.Exit(1)
		}

		if err := app.Init(ctx, repo, args[0]); err != nil {
			log.Error("unable to initalize app", "err", err)
			os.Exit(1)
		}
	},
}
