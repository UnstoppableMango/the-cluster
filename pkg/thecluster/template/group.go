package template

import (
	"path/filepath"

	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type group struct {
	fs   thecluster.Fs
	info fs.FileInfo
	path string
}

// Fs implements thecluster.Workspace
func (g *group) Fs() thecluster.Fs {
	return g.fs
}

// Name implements thecluster.TemplateGroup.
func (g *group) Name() string {
	return filepath.Base(g.path)
}

// Templates implements thecluster.TemplateGroup.
func (g *group) Templates() (iter.Seq[thecluster.Template], error) {
	visit := func(templates iter.Seq[thecluster.Template], path string, info fs.FileInfo) iter.Seq[thecluster.Template] {
		if len(filepath.SplitList(path)) != 1 {
			return templates
		}

		return seqs.Append(templates,
			New(g, path, info),
		)
	}

	s, err := fs.FailFast(fs.IterDirs(g.fs, ""))
	if err != nil {
		return nil, err
	}

	return seqs.Reduce2(s, visit,
		iter.Empty[thecluster.Template](),
	), nil
}

var _ thecluster.TemplateGroup = &group{}
var _ thecluster.Workspace = &group{}

func NewGroup(ws thecluster.Workspace, path string, info fs.FileInfo) thecluster.TemplateGroup {
	scope := fs.ScopeTo(ws.Fs(), path)

	g := &group{
		fs:   scope,
		path: path,
		info: info,
	}

	return g
}
