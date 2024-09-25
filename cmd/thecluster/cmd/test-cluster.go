package cmd

import (
	"github.com/spf13/cobra"
)

var testClusterCmd = &cobra.Command{
	Use:  "test-cluster",
	Long: "Manage a local test cluster",
}

var startTestClusterCmd = &cobra.Command{
	Use:  "start",
	Long: "Start the test cluster",
}

var stopTestClusterCmd = &cobra.Command{
	Use:  "stop",
	Long: "Stop the test cluster",
}

func init() {
	testClusterCmd.AddCommand(startTestClusterCmd)
	testClusterCmd.AddCommand(stopTestClusterCmd)
	rootCmd.AddCommand(testClusterCmd)
}
