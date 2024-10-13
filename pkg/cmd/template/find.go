package template

import (
	"errors"
	"fmt"
	"os"

	"github.com/charmbracelet/log"
	"github.com/spf13/cobra"
	"github.com/unstoppablemango/the-cluster/pkg/styles"
	"github.com/unstoppablemango/the-cluster/pkg/template"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
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

		if t, err := template.Find(ws.Fs(), name); errors.Is(err, template.ErrNotFound) {
			fmt.Printf("Could not find template: %s\n", name)
		} else if err != nil {
			fmt.Printf("wtf: %s\n", err.Error())
			os.Exit(1)
		} else {
			fmt.Println(styles.Template(t))
			for f := range t.Files() {
				fmt.Println(styles.TemplateFile(f))
			}
		}
	},
}
