package template

import (
	"errors"
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var FindCmd = &cobra.Command{
	Use:   "find",
	Short: "Find a template by name",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		log.SetLevel(log.DebugLevel)
		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Error(err)
			os.Exit(1)
		}

		name := args[0]

		if t, err := template.Find(ws.Fs(), name); err != nil {
			fmt.Println(templateStyle.Render(t.Name()))
			for f := range t.Files() {
				fmt.Println(fileStyle.Render(f.Name()))
			}
		} else if errors.Is(err, template.ErrNotFound) {
			fmt.Printf("Could not find template: %s\n", name)
		}
	},
}
