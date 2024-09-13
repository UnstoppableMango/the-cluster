package workspace

import (
	tea "github.com/charmbracelet/bubbletea"
)

type model struct {
	path string
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return nil
}

// Update implements tea.Model.
func (m model) Update(tea.Msg) (tea.Model, tea.Cmd) {
	return m, nil
}

// View implements tea.Model.
func (m model) View() string {
	return m.path
}

var _ tea.Model = model{}
