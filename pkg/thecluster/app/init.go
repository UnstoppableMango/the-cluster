package app

import (
	"context"
	"errors"
	"fmt"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/pulumi/pulumi/sdk/v3/go/common/workspace"
	"github.com/unstoppablemango/the-cluster/internal/util"
)

func Init(ctx context.Context, directory string) error {
	log := log.FromContext(ctx)
	root, err := util.GitRoot()
	if err != nil {
		log.Error("unable to retrieve git root directory", "err", err)
		return err
	}

	templatePath := filepath.Join(root, "templates", "pulumi", "typescript")

	// Basically just:
	// https://github.com/pulumi/pulumi/blob/006a7fc133674a9acce99c286f28f67850478151/pkg/cmd/pulumi/new.go#L195-L221
	repo, err := workspace.RetrieveTemplates(templatePath, true, workspace.TemplateKindPulumiProject)
	if err != nil {
		return fmt.Errorf("unable to retrieve template: %w", err)
	}
	defer func() {
		if err := repo.Delete(); err != nil {
			log.Error("unable to delete template repo", "err", err)
		}
	}()

	templates, err := repo.Templates()
	if err != nil {
		return fmt.Errorf("unable to list repo templates: %w", err)
	}

	var template workspace.Template
	if len(templates) == 0 {
		return errors.New("no templates")
	} else if len(templates) != 1 {
		return fmt.Errorf("found multiple templates at %s", repo.Root)
	} else {
		template = templates[0]
	}

	if template.Errored() {
		return fmt.Errorf("template '%s' is currently broken: %w", template.Name, template.Error)
	}

	return nil
}
