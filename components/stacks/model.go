package stacks

import (
	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var containerStyle = lipgloss.NewStyle().Margin(1, 2)

type Model struct {
	l    list.Model
	h, w int
}

func New() Model {
	width, height := 0, 0
	return Model{
		list.New([]list.Item{}, NewItemDelegate(), width, height),
		width, height,
	}
}

func (m *Model) SetItems(stacks []string) tea.Cmd {
	items := make([]list.Item, 0, len(stacks))
	for _, s := range stacks {
		items = append(items, Item{s})
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
