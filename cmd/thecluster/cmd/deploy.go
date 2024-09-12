package cmd

import (
	"fmt"
	"os"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optpreview"
	"github.com/spf13/cobra"
)

var deployCmd = &cobra.Command{
	Use: "deploy",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := cmd.Context()
		work, err := auto.NewLocalWorkspace(ctx,
			auto.WorkDir("clusters/pinkdiamond"),
		)
		if err != nil {
			return fmt.Errorf("failed creating new local workspace: %w", err)
		}

		err = work.Install(ctx, &auto.InstallOptions{
			Stdout: os.Stdout,
			Stderr: os.Stderr,
		})
		if err != nil {
			return fmt.Errorf("installing deps: %w", err)
		}

		s, err := auto.SelectStack(ctx, "prod", work)
		if err != nil {
			return fmt.Errorf("selecting stack: %w", err)
		}

		_, err = s.Preview(ctx, optpreview.ProgressStreams(os.Stdout))
		if err != nil {
			return fmt.Errorf("previewing stack: %w", err)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(deployCmd)
}
