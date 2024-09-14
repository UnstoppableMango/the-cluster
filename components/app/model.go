package app

import (
	"context"
	"os"
	"os/exec"
	"path"
	"strings"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/unstoppablemango/the-cluster/components/workspace"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

const (
	viewPadding = 5
	pageDelta   = 20
)

var rootModules = []string{
	"apps", "clusters", "components",
	"containers", "dbs", "gen", "infra",
	"lib", "operator", "proto", "tools",
}

type Model struct {
	ctx        context.Context
	ready      bool
	err        error
	workspaces []*tc.Workspace
	rootDir    string
	cursor     int
	view       viewport.Model
}

type ScanComplete struct {
	root    string
	modules []string
	errs    []error
}

type ScanError error

func initialModel(ctx context.Context) Model {
	return Model{ctx: ctx}
}

func scanWorktree() tea.Msg {
	gitRevParse, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return ScanError(err)
	}

	root := strings.TrimSpace(string(gitRevParse))
	modules, errs := []string{}, []error{}
	for _, m := range rootModules {
		p := path.Join(root, m)
		entries, err := os.ReadDir(p)
		if err != nil {
			errs = append(errs, err)
		}

		for _, e := range entries {
			modules = append(modules, path.Join(p, e.Name()))
		}
	}

	return ScanComplete{root, modules, errs}
}

func New(ctx context.Context) Model {
	return initialModel(ctx)
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return scanWorktree
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var (
		cmd            tea.Cmd
		updateViewport bool
	)

	switch msg := msg.(type) {
	case ScanComplete:
		m.rootDir = msg.root
		for _, w := range msg.modules {
			m.workspaces = append(m.workspaces, &tc.Workspace{
				WorkingDirectory: w,
			})
		}
	case ScanError:
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
			ws := workspace.New(m.ctx, m, m.workspaces[m.cursor])
			return ws, ws.Init()
		case "up", "k":
			if m.cursor > 0 {
				m.cursor--
			}
			if m.cursor < m.view.YOffset+viewPadding {
				updateViewport = true
			}
		case "down", "j":
			if m.cursor < len(m.workspaces)-1 {
				m.cursor++
			}
			if m.cursor >= m.view.VisibleLineCount()-viewPadding {
				updateViewport = true
			}
		case "pgup":
			m.cursor = max(m.cursor-pageDelta, 0)
			if m.cursor < m.view.YOffset+viewPadding {
				updateViewport = true
			}
		case "pgdown":
			m.cursor = min(m.cursor+pageDelta, len(m.workspaces)-1)
			if m.cursor >= m.view.VisibleLineCount()-viewPadding {
				updateViewport = true
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

	if updateViewport {
		m.view, cmd = m.view.Update(msg)
	}

	return m, cmd
}

// View implements tea.Model.
func (m Model) View() string {
	if m.err != nil {
		return m.err.Error()
	}
	if !m.ready {
		return "Working..."
	}

	return m.view.View()
}

var _ tea.Model = Model{}
