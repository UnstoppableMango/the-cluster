package workspaces

import (
	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var containerStyle = lipgloss.NewStyle().Margin(1, 2)

type Model struct {
	l    list.Model
	h, w int
	root string
}

func New(root string) Model {
	width, height := 0, 0
	return Model{
		list.New([]list.Item{}, NewItemDelegate(), width, height),
		width, height, root,
	}
}

func (m *Model) SetItems(paths []string) tea.Cmd {
	items := make([]list.Item, 0, len(paths))
	for _, p := range paths {
		items = append(items, Item{m.root, p})
	}

	return m.l.SetItems(items)
}

func (m *Model) SelectedItem() Item {
	if item, ok := m.l.SelectedItem().(Item); ok {
		return item
	} else {
		panic("this should be rare enough that I don't feel like handling the error")
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		x, y := containerStyle.GetFrameSize()
		m.w, m.h = msg.Width-x, msg.Height-y
		m.l.SetSize(m.w, m.h)
	}

	var cmd tea.Cmd
	m.l, cmd = m.l.Update(msg)
	return m, cmd
}

func (m Model) View() string {
	return containerStyle.Render(m.l.View())
}
