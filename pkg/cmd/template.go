package cmd

import (
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/cmd/template"
)

var TemplateCmd = &cobra.Command{
	Use:     "template",
	Short:   "Manage THECLUSTER Templates",
	Aliases: []string{"tmpl", "tpl"},
}

func AddTemplateSubcommands(cmd *cobra.Command) {
	cmd.AddCommand(template.DiscoverCmd)
}
