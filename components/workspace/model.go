package workspace

import (
	"bytes"
	"context"
	"io"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optpreview"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type Model struct {
	ctx     context.Context
	prev    tea.Model
	work    *tc.Workspace
	stack   *auto.Stack
	errs    []error
	content string
}

type (
	Err             error
	Loaded          auto.Workspace
	DepsInstalled   string
	StackSelected   *auto.Stack
	PreviewComplete string
)

func (m Model) load() tea.Msg {
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

		return StackSelected(&s)
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

func New(ctx context.Context, prev tea.Model, w *tc.Workspace) Model {
	return Model{ctx, prev, w, nil, []error{}, ""}
}

// Init implements tea.Model.
func (m Model) Init() tea.Cmd {
	return m.load
}

// Update implements tea.Model.
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case Err:
		m.errs = append(m.errs, msg)
	case Loaded:
		return m, m.selectStack(msg)
	case StackSelected:
		var s *auto.Stack = msg
		return m, m.installDeps(s.Workspace())
	case DepsInstalled:
		m.content = string(msg)
	case PreviewComplete:
		m.content = string(msg)
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "esc":
			return m.prev, nil
		case "enter":
			if m.stack == nil {
				return m, nil
			}

			return m, m.preview(m.stack)
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

	if m.content != "" {
		return m.content
	}

	return "Loading..."
}

var _ tea.Model = Model{}
