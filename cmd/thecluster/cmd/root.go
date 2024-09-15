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
	"github.com/unstoppablemango/the-cluster/internal/thecluster"
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
		config.RootModules = []string{
			"apps", "clusters", "infra",
		}

		if config.Interactive {
			return runInteractive(ctx, config)
		}

		if config.CI {
			return runCi(ctx, config, args)
		}

		return nil
	},
}

func Execute(ctx context.Context) {
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

func runCi(ctx context.Context, config thecluster.Config, args []string) error {
	return nil
}

func createLogger() *log.Logger {
	logFile, err := tea.LogToFile("./log.txt", "debug")
	if err != nil {
		return log.Default()
	}

	return log.New(logFile)
}
