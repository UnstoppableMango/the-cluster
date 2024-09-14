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

		p := tea.NewProgram(app.New(ctx, root),
			tea.WithAltScreen(),
			tea.WithContext(ctx),
		)

		_, err = p.Run()
		if err != nil {
			return err
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

func createLogger() *log.Logger {
	logFile, err := tea.LogToFile("./log.txt", "debug")
	if err != nil {
		return log.Default()
	}

	return log.New(logFile)
}
