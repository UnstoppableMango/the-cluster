package workspace

import (
	"bytes"
	"context"
	"io"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optpreview"
	"github.com/unstoppablemango/the-cluster/components/stacks"
)

type Model struct {
	ctx    context.Context
	prev   tea.Model
	h, w   int
	ready  bool
	stacks stacks.Model
	path   string
	err    error
}

type (
	Err             error
	Loaded          auto.Workspace
	DepsInstalled   string
	StackSelected   auto.Stack
	PreviewComplete string
)

func (m Model) load() tea.Msg {
	log := log.FromContext(m.ctx)
	work, err := auto.NewLocalWorkspace(m.ctx,
		auto.WorkDir(m.path),
	)
	if err != nil {
		log.Error("failed creating new local workspace", "err", err)
		return Err(err)
	}

	return Loaded(work)
}

func (m Model) loaded(w auto.Workspace) (tea.Model, tea.Cmd) {
	l := loadedModel{stacks.New(), w}
	return l, l.Init()
}

func (m Model) installDeps(workspace auto.Workspace) tea.Cmd {
	return func() tea.Msg {
		stdout, stderr := &bytes.Buffer{}, &bytes.Buffer{}
		err := workspace.Install(m.ctx, &auto.InstallOptions{
			Stdout: stdout,
			Stderr: stderr,
		})
		if err != nil {
			log.Error("failed installing deps", "err", err)
			return Err(err)
		}

		logs, err := io.ReadAll(stdout)
		if err != nil {
			return Err(err)
		}

		return DepsInstalled(string(logs))
	}
}

func (m Model) selectStack(work auto.Workspace) tea.Cmd {
	return func() tea.Msg {
		s, err := auto.SelectStack(m.ctx, "prod", work)
		if err != nil {
			log.Error("failed selecting stack", "err", err)
			return Err(err)
		}

		return StackSelected(s)
	}
}

func (m Model) preview(s *auto.Stack) tea.Cmd {
	return func() tea.Msg {
		buf := &bytes.Buffer{}
		_, err := s.Preview(m.ctx,
			optpreview.ProgressStreams(buf),
		)
		if err != nil {
			log.Error("failed previewing stack", "err", err)
			return Err(err)
		}

		logs, err := io.ReadAll(buf)
		if err != nil {
			return Err(err)
		}

		return PreviewComplete(logs)
	}
}

func New(ctx context.Context, path string, prev tea.Model, h, w int) Model {
	return Model{
		ctx:    ctx,
		prev:   prev,
		h:      h,
		w:      w,
		ready:  false,
		stacks: stacks.New(),
		path:   path,
		err:    nil,
	}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return m.load
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case Err:
		m.err = msg
		m.ready = true
	case Loaded:
		m.ready = true
		return m.loaded(msg)
	}

	return m, nil
}

// View implements tea.Model.
func (m Model) View() string {
	if m.err != nil {
		return m.err.Error()
	}
	if !m.ready {
		return "Loading..."
	}

	return "Workspace loaded"
}

var _ tea.Model = Model{}
