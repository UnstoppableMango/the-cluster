package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/test/utils"
)

var testClusterCmd = &cobra.Command{
	Use:   "test-cluster",
	Short: "Manage a local test cluster",
}

var startTestClusterCmd = &cobra.Command{
	Use:   "start",
	Short: "Start the test cluster",
	RunE: func(cmd *cobra.Command, args []string) error {
		c := utils.NewTestCluster(
			utils.WithLoggers(os.Stdout),
		)
		return c.Start(cmd.Context())
	},
}

var stopTestClusterCmd = &cobra.Command{
	Use:   "stop",
	Short: "Stop the test cluster",
	RunE: func(cmd *cobra.Command, args []string) error {
		c := utils.NewTestCluster(
			utils.WithLoggers(os.Stdout),
		)
		return c.Stop(cmd.Context())
	},
}

var kubeconfigTestClusterCmd = &cobra.Command{
	Use:   "kubeconfig",
	Short: "Print the test cluster kubeconfig",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		c := utils.NewTestCluster(
			utils.WithLoggers(os.Stdout),
		)

		kubeconfig, err := c.GetKubeConfig(ctx)
		if err != nil {
			return err
		}

		_, err = fmt.Println(string(kubeconfig))
		return err
	},
}

func init() {
	testClusterCmd.AddCommand(startTestClusterCmd)
	testClusterCmd.AddCommand(stopTestClusterCmd)
	testClusterCmd.AddCommand(kubeconfigTestClusterCmd)
	rootCmd.AddCommand(testClusterCmd)
}
