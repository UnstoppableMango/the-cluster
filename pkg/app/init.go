package app

import (
	"context"
	"fmt"
	"path/filepath"

	"github.com/unstoppablemango/the-cluster/pkg/template"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

const DefaultTemplate = "typescript"

type projectName struct {
	appPath string
}

func (d projectName) Name() string {
	return filepath.Base(d.appPath)
}

func (d projectName) Pulumi() string {
	return fmt.Sprintf("thecluster-%s", d.Name())
}

type Initializer interface {
	Init(context.Context, string) (thecluster.Fs, error)
}

type tmplData struct {
	Project     string
	Description string
}

func Init(root thecluster.Workspace, appPath string) (thecluster.App, error) {
	if filepath.IsAbs(appPath) {
		if rel, err := filepath.Rel(root.Path(), appPath); err != nil {
			return nil, err
		} else {
			appPath = rel
		}
	}

	tmpl, err := template.Find(root.Fs(), DefaultTemplate)
	if err != nil {
		return nil, fmt.Errorf("searching for template '%s': %w", DefaultTemplate, err)
	}

	name := projectName{appPath}
	writable, err := workspace.With(workspace.At(root.Fs(), appPath),
		workspace.WriteTemplate(tmpl, &tmplData{
			Project:     name.Pulumi(),
			Description: fmt.Sprintf("THECLUSTER install for %s", name.Name()),
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("writing template to workspace: %w", err)
	}

	return &app{
		Workspace: writable,
		name:      name.Name(),
	}, nil
}

func ProjectName(name string) string {
	return fmt.Sprintf("thecluster-%s", name)
}
