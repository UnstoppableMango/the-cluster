package workspace

import (
	"context"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type model struct {
	ctx     context.Context
	loading bool
	prev    tea.Model
	work    *tc.Workspace
	errs    []error
}

type workspaceError error

type workspaceLoaded *auto.Workspace

func loadWorkspace(m model) tea.Cmd {
	return func() tea.Msg {
		log := log.FromContext(m.ctx)
		work, err := auto.NewLocalWorkspace(m.ctx,
			auto.WorkDir("clusters/pinkdiamond"),
		)
		if err != nil {
			log.Error("failed creating new local workspace", "err", err)
			return workspaceError(err)
		}

		err = work.Install(m.ctx, &auto.InstallOptions{
			// Stdout: os.Stdout,
			// Stderr: os.Stderr,
		})
		if err != nil {
			log.Error("failed installing deps", "err", err)
			return workspaceError(err)
		}

		// s, err := auto.SelectStack(m.ctx, "prod", work)
		// if err != nil {
		// 	log.Error("failed selecting stack", "err", err)
		// 	return workspaceError(err)
		// }

		// _, err = s.Preview(m.ctx, optpreview.ProgressStreams(os.Stdout))
		// if err != nil {
		// 	log.Error("failed previewing stack", "err", err)
		// 	return workspaceError(err)
		// }

		return workspaceLoaded(&work)
	}
}

func New(ctx context.Context, prev tea.Model, w *tc.Workspace) tea.Model {
	return model{ctx, true, prev, w, []error{}}
}

// Init implements tea.Model.
func (m model) Init() tea.Cmd {
	return loadWorkspace(m)
}

// Update implements tea.Model.
func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case workspaceError:
		m.errs = append(m.errs, msg)
		m.loading = false
	case workspaceLoaded:
		m.loading = false
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		case "esc":
			return m.prev, nil
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
