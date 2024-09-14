package workspace

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/unstoppablemango/the-cluster/components/stacks"
)

type loadedModel struct {
	stacks stacks.Model
	work   auto.Workspace
}

// Init implements tea.Model.
func (m loadedModel) Init() tea.Cmd {
	return m.stacks.Init()
}

// Update implements tea.Model.
func (m loadedModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	m.stacks, cmd = m.stacks.Update(msg)
	return m, cmd
}

// View implements tea.Model.
func (m loadedModel) View() string {
	return m.stacks.View()
}

var _ tea.Model = loadedModel{}
