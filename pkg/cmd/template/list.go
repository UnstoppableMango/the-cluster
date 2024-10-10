package template

import (
	"fmt"
	"os"

	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var (
	groupStyle    = lipgloss.NewStyle()
	templateStyle = lipgloss.NewStyle().MarginLeft(1)
	fileStyle     = lipgloss.NewStyle().MarginLeft(2)
)

var ListCmd = &cobra.Command{
	Use:   "list",
	Short: "List valid templates",
	Run: func(cmd *cobra.Command, args []string) {
		log.SetLevel(log.DebugLevel)
		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Error(err)
			os.Exit(1)
		}

		for g := range template.List(ws, template.RelativePath) {
			fmt.Println(groupStyle.Render(g.Name()))

			templates, err := g.Templates()
			if err != nil {
				log.Error(err)
				os.Exit(1)
			}

			for t := range templates {
				fmt.Println(templateStyle.Render(t.Name()))
				for f := range t.Files() {
					fmt.Println(fileStyle.Render(f.Name()))
				}
			}
		}
	},
}
