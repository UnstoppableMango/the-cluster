package template

import (
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

var DiscoverCmd = &cobra.Command{
	Use:   "discover",
	Short: "Discover templates",
	Run: func(cmd *cobra.Command, args []string) {
		log.SetLevel(log.DebugLevel)
		ws, err := workspace.NewLocalGit()
		if err != nil {
			log.Error(err)
			os.Exit(1)
		}

		for r := range template.Discover(ws, template.RelativePath) {
			g, err := r.Unwrap()
			if err != nil {
				log.Error(err)
				os.Exit(1)
			}

			log.Info("found group", "name", g.Name())
		}
	},
}
