package template

import (
	"path/filepath"

	"github.com/unstoppablemango/the-cluster/internal/iter"
	"github.com/unstoppablemango/the-cluster/internal/seq"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type group struct {
	fs   thecluster.Fs
	info fs.FileInfo
	path string
}

// Name implements thecluster.TemplateGroup.
func (g *group) Name() string {
	return filepath.Base(g.path)
}

// Templates implements thecluster.TemplateGroup.
func (g *group) Templates() iter.Seq[thecluster.Template] {
	visit := func(templates iter.Seq[thecluster.Template], path string, info fs.FileInfo, err error) iter.Seq[thecluster.Template] {
		if err != nil {
			return templates
		}
		if len(filepath.SplitList(path)) != 1 {
			return templates
		}

		return seq.Append(templates, New())
	}

	return seq.Reduce3(
		fs.IterDirs(g.fs, ""),
		visit,
		seq.Empty[thecluster.Template](),
	)
}

var _ thecluster.TemplateGroup = &group{}

func NewGroup(ws thecluster.Workspace, path string, info fs.FileInfo) thecluster.TemplateGroup {
	scope := fs.ScopeTo(ws.Fs(), path)

	g := &group{
		fs:   scope,
		path: path,
		info: info,
	}

	return g
}
