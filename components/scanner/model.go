package scanner

import (
	"bufio"
	"io"

	tea "github.com/charmbracelet/bubbletea"
)

type (
	Line string
	eof  struct{}
)

var Eof = eof{}

type Model struct {
	s     *bufio.Scanner
	text  string
	lines []string
	done  bool
}

func New(r io.Reader) Model {
	return Model{bufio.NewScanner(r), "", []string{}, false}
}

func (m Model) next() tea.Msg {
	if m.s.Scan() {
		return Line(m.s.Text())
	} else {
		return eof{}
	}
}

func (m Model) Scan() {
	var iter tea.Model = m
	cmd := m.Init()
	for !m.done {
		iter, cmd = m.Update(cmd())
		switch iter := iter.(type) {
		case Model:
			m = iter
		default:
			panic("how did we get here")
		}
	}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return m.next
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case eof:
		m.done = true
		return m, nil
	case Line:
		m.text = string(msg)
		m.lines = append(m.lines, m.text)
	}

	return m, m.next
}

// View implements tea.Model.
func (m Model) View() string {
	return m.s.Text()
}

var _ tea.Model = Model{}
