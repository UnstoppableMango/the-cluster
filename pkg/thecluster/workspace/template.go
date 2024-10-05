package workspace

import (
	"errors"
	"iter"
	"path/filepath"

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

func Templates(workspace thecluster.Workspace, path string) (iter.Seq[thecluster.TemplateGroup], error) {
	return nil, errors.New("unimplemented")
}
