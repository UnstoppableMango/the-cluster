package template

import (
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/styles"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
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

		for g := range template.List(ws.Fs()) {
			fmt.Println(styles.TemplateGroup(g))

			templates, err := g.Templates()
			if err != nil {
				log.Error(err)
				os.Exit(1)
			}

			for t := range templates {
				fmt.Println(styles.Template(t))
				for f := range t.Files() {
					fmt.Println(styles.TemplateFile(f))
				}
			}
		}
	},
}
