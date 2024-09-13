package workspace

import (
	tea "github.com/charmbracelet/bubbletea"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type model struct {
	work *tc.Workspace
}

type workspaceLoaded string

func loadWorkspace(m model) tea.Cmd {
	return func() tea.Msg {
		return nil
	}
}

func New(w *tc.Workspace) tea.Model {
	return model{w}
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return loadWorkspace(m)
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
	return m.work.WorkingDirectory
}

var _ tea.Model = model{}
