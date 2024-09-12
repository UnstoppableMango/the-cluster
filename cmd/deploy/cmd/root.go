package cmd

import (
	"context"
	"fmt"
	"os"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/spf13/cobra"
	"golang.org/x/exp/slog"
)

var log = slog.New(slog.NewTextHandler(os.Stdout, nil))

var rootCmd = &cobra.Command{
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

		res, err := s.Preview(ctx)
		if err != nil {
			return fmt.Errorf("previewing stack: %w", err)
		}

		log.Error(res.StdErr)
		log.Info(res.StdOut)

		return nil
	},
}

func Execute(ctx context.Context) {
	if err := rootCmd.ExecuteContext(ctx); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
