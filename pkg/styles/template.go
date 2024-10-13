package styles

import (
	"github.com/charmbracelet/lipgloss"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var (
	templateStyle      = lipgloss.NewStyle().MarginLeft(2)
	templateFileStyle  = lipgloss.NewStyle().MarginLeft(4)
	templateGroupStyle = lipgloss.NewStyle()
)

func Template(t thecluster.Template) string {
	return templateStyle.Render(t.Name())
}

func TemplateFile(f thecluster.TemplateFile) string {
	return templateFileStyle.Render(f.Name())
}

func TemplateGroup(g thecluster.TemplateGroup) string {
	return templateGroupStyle.Render(g.Name())
}
