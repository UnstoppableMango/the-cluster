package template

import (
	"errors"
	"fmt"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/common/workspace"
	"github.com/unstoppablemango/the-cluster/internal/util"
)

// Basically just:
// https://github.com/pulumi/pulumi/blob/006a7fc133674a9acce99c286f28f67850478151/pkg/cmd/pulumi/new.go#L195-L221

func Typescript() (workspace.Template, error) {
	root, err := util.GitRoot()
	if err != nil {
		return workspace.Template{}, fmt.Errorf("unable to locate git root directory: %w", err)
	}

	templatePath := filepath.Join(root, "templates", "pulumi", "typescript")
	tplRepo, err := workspace.RetrieveTemplates(templatePath, true, workspace.TemplateKindPulumiProject)
	if err != nil {
		return workspace.Template{}, fmt.Errorf("unable to retrieve template: %w", err)
	}
	defer func() {
		if err := tplRepo.Delete(); err != nil {
			log.Error("unable to delete template repo", "err", err)
		}
	}()

	templates, err := tplRepo.Templates()
	if err != nil {
		return workspace.Template{}, fmt.Errorf("unable to list repo templates: %w", err)
	}

	var template workspace.Template
	if len(templates) == 0 {
		return workspace.Template{}, errors.New("no templates")
	} else if len(templates) != 1 {
		return workspace.Template{}, fmt.Errorf("found multiple templates at %s", tplRepo.Root)
	} else {
		template = templates[0]
	}

	if template.Errored() {
		return workspace.Template{}, fmt.Errorf("template '%s' is currently broken: %w", template.Name, template.Error)
	}

	return template, nil
}
