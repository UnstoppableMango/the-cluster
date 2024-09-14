package scanner

import (
	"bufio"
	"io"

	tea "github.com/charmbracelet/bubbletea"
)

type (
	Line string
	Eof  struct{}
)

type Model struct {
	s *bufio.Scanner
}

func New(r io.Reader) Model {
	return Model{bufio.NewScanner(r)}
}

func (m Model) next() tea.Msg {
	if m.s.Scan() {
		return Line(m.s.Text())
	} else {
		return Eof{}
	}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return m.next
}

// Update implements tea.Model.
func (m Model) Update(tea.Msg) (tea.Model, tea.Cmd) {
	return m, m.next
}

// View implements tea.Model.
func (m Model) View() string {
	return m.s.Text()
}

var _ tea.Model = Model{}
