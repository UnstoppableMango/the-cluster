package cmd

import (
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/cmd/app"
)

var appCmd = &cobra.Command{
	Use:   "app",
	Short: "Manage THECLUSTER Apps",
}

func init() {
	appCmd.AddCommand(app.InitCmd)
	rootCmd.AddCommand(appCmd)
}
