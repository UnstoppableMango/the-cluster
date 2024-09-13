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

type model struct {
	ctx     context.Context
	loading bool
	prev    tea.Model
	work    *tc.Workspace
	stack   *auto.Stack
	errs    []error
	buf     *bytes.Buffer
}

type (
	workspaceError  error
	workspaceLoaded auto.Workspace
	depsInstalled   struct{}
	stackSelected   auto.Stack
)

func (m model) loadWorkspace() tea.Msg {
	log := log.FromContext(m.ctx)
	work, err := auto.NewLocalWorkspace(m.ctx,
		auto.WorkDir(m.work.WorkingDirectory),
	)
	if err != nil {
		log.Error("failed creating new local workspace", "err", err)
		return workspaceError(err)
	}

	return workspaceLoaded(work)
}

func (m model) installDeps() tea.Msg {
	workspace := m.stack.Workspace()
	err := workspace.Install(m.ctx, &auto.InstallOptions{
		Stdout: m.buf,
		Stderr: m.buf,
	})
	if err != nil {
		log.Error("failed installing deps", "err", err)
		return workspaceError(err)
	}

	return depsInstalled{}
}

func (m model) selectStack(work auto.Workspace) tea.Cmd {
	return func() tea.Msg {
		s, err := auto.SelectStack(m.ctx, "prod", work)
		if err != nil {
			log.Error("failed selecting stack", "err", err)
			return workspaceError(err)
		}

		return stackSelected(s)
	}
}

func (m model) preview() tea.Msg {
	if m.stack == nil {
		return workspaceError(errors.New("no stack selected"))
	}

	_, err := m.stack.Preview(m.ctx, optpreview.ProgressStreams(m.buf))
	if err != nil {
		log.Error("failed previewing stack", "err", err)
		return workspaceError(err)
	}

	return nil
}

func New(ctx context.Context, prev tea.Model, w *tc.Workspace) tea.Model {
	return model{ctx, true, prev, w, nil, []error{}, &bytes.Buffer{}}
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return m.loadWorkspace
}

// Update implements tea.Model.
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case workspaceError:
		m.errs = append(m.errs, msg)
		m.loading = false
	case workspaceLoaded:
		return m, m.selectStack(msg)
	case stackSelected:
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
func (m model) View() string {
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

var _ tea.Model = model{}
