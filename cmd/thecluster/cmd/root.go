package cmd

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/components/app"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
	"github.com/unstoppablemango/the-cluster/internal/thecluster"
)

var (
	component   string
	interactive bool
)

var rootCmd = &cobra.Command{
	Use: "thecluster",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := log.WithContext(cmd.Context(), createLogger())
		revParse, err := exec.CommandContext(ctx,
			"git", "rev-parse", "--show-toplevel",
		).Output()
		if err != nil {
			return err
		}

		root := strings.TrimSpace(string(revParse))
		config := thecluster.NewConfig(root)
		config.Interactive = interactive
		config.RootModules = []string{
			"apps", "clusters", "infra",
		}

		if config.Interactive {
			return runInteractive(ctx, config)
		}

		req := &tc.ReconcileRequest{
			Component: component,
			Stack:     "pinkdiamond",
		}

		if config.CI {
			return runCi(ctx, config, req)
		}

		return run(ctx, config, req)
	},
}

func Execute(ctx context.Context) {
	rootCmd.Flags().BoolVar(&interactive, "interactive", false, "Launch the TUI")
	rootCmd.Flags().StringVar(&component, "component", "", "The component to reconcile")

	if err := rootCmd.ExecuteContext(ctx); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func runInteractive(ctx context.Context, config thecluster.Config) error {
	p := tea.NewProgram(app.New(ctx, config),
		tea.WithAltScreen(),
		tea.WithContext(ctx),
	)

	_, err := p.Run()
	if err != nil {
		return err
	}

	return nil
}

func runCi(ctx context.Context, _ thecluster.Config, _ *tc.ReconcileRequest) error {
	log := log.FromContext(ctx)
	log.Info("Nothing to do")
	return nil
}

func run(ctx context.Context, config thecluster.Config, req *tc.ReconcileRequest) error {
	r := thecluster.Reconciler{
		Config: config,
		Stdout: os.Stdout,
		Stderr: os.Stderr,
	}

	res, err := r.Reconcile(ctx, req)
	if err != nil {
		return err
	}

	fmt.Fprintln(os.Stdout, res.Root)
	return nil
}

func createLogger() *log.Logger {
	if !interactive {
		return log.New(os.Stdout)
	}

	logFile, err := tea.LogToFile("./log.txt", "debug")
	if err != nil {
		return log.Default()
	}

	return log.New(logFile)
}
