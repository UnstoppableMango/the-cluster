package cmd

import (
	"github.com/spf13/cobra"
)

var deployCmd = &cobra.Command{
	Use: "deploy",
	RunE: func(cmd *cobra.Command, args []string) error {
		return nil
	},
}

func init() {
	rootCmd.AddCommand(deployCmd)
}
