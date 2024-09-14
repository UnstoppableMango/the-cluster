package workspace

import (
	"bytes"
	"context"
	"errors"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optpreview"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type Model struct {
	ctx     context.Context
	loading bool
	prev    tea.Model
	work    *tc.Workspace
	stack   *auto.Stack
	errs    []error
	buf     *bytes.Buffer
}

type (
	Err           error
	Loaded        auto.Workspace
	DepsInstalled struct{}
	StackSelected auto.Stack
)

func (m Model) loadWorkspace() tea.Msg {
	log := log.FromContext(m.ctx)
	work, err := auto.NewLocalWorkspace(m.ctx,
		auto.WorkDir(m.work.WorkingDirectory),
	)
	if err != nil {
		log.Error("failed creating new local workspace", "err", err)
		return Err(err)
	}

	return Loaded(work)
}

func (m Model) installDeps() tea.Msg {
	workspace := m.stack.Workspace()
	err := workspace.Install(m.ctx, &auto.InstallOptions{
		Stdout: m.buf,
		Stderr: m.buf,
	})
	if err != nil {
		log.Error("failed installing deps", "err", err)
		return Err(err)
	}

	return DepsInstalled{}
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

func (m Model) preview() tea.Msg {
	if m.stack == nil {
		return Err(errors.New("no stack selected"))
	}

	_, err := m.stack.Preview(m.ctx, optpreview.ProgressStreams(m.buf))
	if err != nil {
		log.Error("failed previewing stack", "err", err)
		return Err(err)
	}

	return nil
}

func New(ctx context.Context, prev tea.Model, w *tc.Workspace) tea.Model {
	return Model{ctx, true, prev, w, nil, []error{}, &bytes.Buffer{}}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return m.loadWorkspace
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case Err:
		m.errs = append(m.errs, msg)
		m.loading = false
	case Loaded:
		return m, m.selectStack(msg)
	case StackSelected:
		m.loading = false
		return m, m.installDeps
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "esc":
			return m.prev, nil
		case "enter":
			return m, m.preview
		}
	}

	return m, nil
}

// View implements tea.Model.
func (m Model) View() string {
	if len(m.errs) > 0 {
		b := strings.Builder{}
		for _, err := range m.errs {
			b.WriteString(err.Error() + "\n")
		}
		return b.String()
	}
	if m.loading {
		return "Loading..."
	}

	return m.work.WorkingDirectory
}

var _ tea.Model = Model{}
