package cmd

import (
	"context"
	"fmt"
	"io"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/cmd/thecluster/app"
)

var rootCmd = &cobra.Command{
	Use: "thecluster",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := log.WithContext(cmd.Context(), createLogger())
		p := tea.NewProgram(app.New(ctx),
			tea.WithAltScreen(),
			tea.WithContext(ctx),
		)

		_, err := p.Run()
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
	logFile, err := os.Create("./log.txt")
	var logTarget io.Writer
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
	} else {
		logTarget = logFile
	}

	return log.New(logTarget)
}
