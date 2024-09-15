package app

import (
	"context"
	"os"
	"path"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/unstoppablemango/the-cluster/components/workspace"
	"github.com/unstoppablemango/the-cluster/components/workspaces"
	"github.com/unstoppablemango/the-cluster/internal/thecluster"
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
	h, w       int
	ready      bool
	err        error
	rootDir    string
	workspaces workspaces.Model
}

type ScanComplete struct {
	root    string
	modules []string
	errs    []error
}

type ScanError error

func (m Model) scanWorktree() tea.Msg {
	modules, errs := []string{}, []error{}
	for _, mod := range rootModules {
		p := path.Join(m.rootDir, mod)
		entries, err := os.ReadDir(p)
		if err != nil {
			errs = append(errs, err)
		}

		for _, e := range entries {
			modules = append(modules, path.Join(p, e.Name()))
		}
	}

	return ScanComplete{m.rootDir, modules, errs}
}

func New(ctx context.Context, config thecluster.Config) Model {
	ws := workspaces.New(config.Root)

	return Model{
		ctx:        ctx,
		workspaces: ws,
		rootDir:    config.Root,
		ready:      false,
		err:        nil,
	}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		m.scanWorktree,
		m.workspaces.Init(),
	)
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case ScanComplete:
		m.rootDir = msg.root
		m.ready = true
		return m, m.workspaces.SetItems(msg.modules)
	case ScanError:
		m.err = msg
	case tea.WindowSizeMsg:
		m.h, m.w = msg.Height, msg.Width
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
		case "enter", " ":
			item := m.workspaces.SelectedItem()
			return m.selectWorkspace(item)
		case "up", "k":
		case "down", "j":
		case "pgup":
		case "pgdown":
		}
	}

	var cmd tea.Cmd
	m.workspaces, cmd = m.workspaces.Update(msg)
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

	return m.workspaces.View()
}

var _ tea.Model = Model{}

func (m Model) selectWorkspace(w workspaces.Item) (tea.Model, tea.Cmd) {
	work := workspace.New(m.ctx, w.Path(), m, m.h, m.w)
	return work, work.Init()
}
