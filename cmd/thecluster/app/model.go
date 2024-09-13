package app

import (
	"os"
	"os/exec"
	"path"
	"strings"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

var rootModules = []string{
	"apps", "clusters", "components",
	"containers", "dbs", "gen", "infra",
	"lib", "operator", "proto", "tools",
}

type model struct {
	ready      bool
	err        error
	workspaces []tc.Workspace
	rootDir    string
	cursor     int
	view       viewport.Model
}

type scanComplete struct {
	root    string
	modules []string
}

type scanError error

func initialModel() model {
	return model{}
}

func scanWorktree() tea.Msg {
	gitRevParse, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return scanError(err)
	}

	root := strings.TrimSpace(string(gitRevParse))
	modules := []string{}
	for _, m := range rootModules {
		p := path.Join(root, m)
		entries, err := os.ReadDir(p)
		if err != nil {
			return scanError(err)
		}

		for _, e := range entries {
			modules = append(modules, path.Join(p, e.Name()))
		}
	}

	return scanComplete{root, modules}
}

func New() tea.Model {
	return initialModel()
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return scanWorktree
}

// Update implements tea.Model.
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch msg := msg.(type) {
	case scanComplete:
		m.rootDir = msg.root
		for _, w := range msg.modules {
			m.workspaces = append(m.workspaces, tc.Workspace{
				WorkingDirectory: w,
			})
		}
	case scanError:
		m.err = msg
	case tea.WindowSizeMsg:
		if !m.ready {
			m.view = viewport.New(msg.Width, msg.Height)
			m.ready = true
		} else {
			m.view.Width = msg.Width
			m.view.Height = msg.Height
		}
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "enter", " ":
			// m.workspaces[m.cursor]
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}
		case "down", "j":
			if m.cursor < len(m.workspaces)-1 {
				m.cursor++
			}
		}
	}

	if m.ready {
		paths, err := m.displayPaths()
		if err == nil {
			content := strings.Join(paths, "\n")
			m.view.SetContent(content)
		}
	}

	m.view, cmd = m.view.Update(msg)

	return m, cmd
}

// View implements tea.Model.
func (m model) View() string {
	if m.err != nil {
		return m.err.Error()
	}
	if !m.ready {
		return "Working..."
	}

	return m.view.View()
}

var _ tea.Model = model{}
