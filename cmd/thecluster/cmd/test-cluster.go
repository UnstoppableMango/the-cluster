package cmd

import (
	"errors"
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/testing"
	"github.com/unstoppablemango/the-cluster/test/utils"
)

var testClusterCmd = &cobra.Command{
	Use:   "test-cluster",
	Short: "Manage a local test cluster",
}

var startTestClusterCmd = &cobra.Command{
	Use:   "start",
	Short: "Start the test cluster",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		kubeconfig := args[0]

		c := testing.NewCluster(
			testing.WriteTo(os.Stdout),
			testing.WithKubeconfigPath(kubeconfig),
		)

		if err := c.CreateTestCluster(); err != nil {
			log.Error("failed creating test cluster", "err", err)
			os.Exit(1)
		}
	},
}

var stopTestClusterCmd = &cobra.Command{
	Use:   "stop",
	Short: "Stop the test cluster",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		kubeconfig := args[0]
		if _, err := os.Stat(kubeconfig); errors.Is(err, os.ErrNotExist) {
			log.Error("unable to find kubeconfig", "err", err)
		}

		c := testing.NewCluster(
			testing.WriteTo(os.Stdout),
			testing.WithKubeconfigPath(kubeconfig),
		)

		if err := c.DeleteTestCluster(); err != nil {
			log.Error("failed deleting test cluster", "err", err)
			os.Exit(1)
		}
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
