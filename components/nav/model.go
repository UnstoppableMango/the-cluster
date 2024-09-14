package nav

import (
	tea "github.com/charmbracelet/bubbletea"
)

type Model struct {
	cur     tea.Model
	history []tea.Model
}

type (
	Pushed tea.Model
)

func New() Model {
	return Model{nil, []tea.Model{}}
}

func Push(v tea.Model) tea.Cmd {
	return func() tea.Msg {
		return Pushed(v)
	}
}

func (m Model) Update(msg tea.Msg) (Model, tea.Cmd) {
	switch msg := msg.(type) {
	case Pushed:
		m.cur = msg
		m.history = append(m.history, msg)
	}

	return m, nil
}
