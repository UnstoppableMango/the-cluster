package cmd

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type model struct {
	workspaces map[string]*tc.Workspace
}

func initialModel() model {
	return model{
		workspaces: make(map[string]*tc.Workspace),
	}
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return nil
}

// Update implements tea.Model.
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		}
	}

	return m, nil
}

// View implements tea.Model.
func (m model) View() string {
	keys := make([]string, 0, len(m.workspaces))
	for k := range m.workspaces {
		keys = append(keys, k)
	}

	return strings.Join(keys, "\n")
}

var _ tea.Model = model{}
