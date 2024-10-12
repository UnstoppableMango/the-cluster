package workspace

import (
	"fmt"
	"path/filepath"

	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/template"
)

func TemplatesPath(workspace thecluster.Workspace) (string, error) {
	root, err := Root(workspace)
	if err != nil {
		return "", err
	}

	return filepath.Join(root, template.RelativePath), nil
}

func Templates(
	workspace thecluster.Workspace,
	options ...template.DiscoverOption,
) iter.Seq[thecluster.TemplateGroup] {
	return template.List(workspace.Fs(), options...)
}

func WriteTemplate(tmpl thecluster.Template, state any) Writer {
	return func(w Writable) error {
		tmplFs, err := template.Execute(tmpl, state)
		if err != nil {
			return err
		}

		if err = fs.Copy(tmplFs, w.Fs()); err != nil {
			return fmt.Errorf("copying template to workspace: %s", err)
		}

		return nil
	}
}
