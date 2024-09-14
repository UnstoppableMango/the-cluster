package workspaces

import (
	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var docStyle = lipgloss.NewStyle().Margin(1, 2)

type Item struct {
	path string
}

func (i Item) Title() string       { return i.path }
func (i Item) Description() string { return "heh" }

// FilterValue implements list.Item.
func (i Item) FilterValue() string {
	return i.path
}

type Model struct {
	l     list.Model
	paths []string
}

func New(ws []string) Model {
	items := []list.Item{}
	for _, w := range ws {
		items = append(items, Item{w})
	}

	list := list.New(items, list.NewDefaultDelegate(), 0, 0)
	return Model{list, ws}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return nil
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			return m, tea.Quit
		}
	case tea.WindowSizeMsg:
		h, v := docStyle.GetFrameSize()
		m.l.SetSize(msg.Width-h, msg.Height-v)
	}

	var cmd tea.Cmd
	m.l, cmd = m.l.Update(msg)
	return m, cmd
}

// View implements tea.Model.
func (m Model) View() string {
	return docStyle.Render(m.l.View())
}

var _ list.Item = Item{}
var _ tea.Model = Model{}
