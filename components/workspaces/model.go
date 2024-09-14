package workspaces

import (
	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var containerStyle = lipgloss.NewStyle().Margin(1, 2)

type Model struct {
	l    list.Model
	root string
}

func New(root string) Model {
	return Model{
		list.New([]list.Item{}, NewItemDelegate(), 0, 0),
		root,
	}
}

func (m *Model) SetItems(paths []string) tea.Cmd {
	items := make([]list.Item, 0, len(paths))
	for _, p := range paths {
		items = append(items, Item{m.root, p})
	}

	return m.l.SetItems(items)
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		h, v := containerStyle.GetFrameSize()
		m.l.SetSize(msg.Width-h, msg.Height-v)
	}

	var cmd tea.Cmd
	m.l, cmd = m.l.Update(msg)
	return m, cmd
}

func (m Model) View() string {
	return containerStyle.Render(m.l.View())
}
