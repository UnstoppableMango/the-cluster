package app

import (
	"errors"

	"github.com/charmbracelet/log"
	"github.com/unmango/go/iter"
	"github.com/unstoppablemango/the-cluster/pkg/deps"
	"github.com/unstoppablemango/the-cluster/pkg/packagejson"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

const (
	StandardDir = "apps"
)

var (
	ErrNotFound      = errors.New("app dir not found")
	ErrNotSuppported = errors.New("not supported")
)

type app struct {
	thecluster.Workspace
	name string
	root thecluster.Fs
}

// Dependencies implements thecluster.App.
func (a *app) Dependencies() (iter.Seq[thecluster.Dependency], error) {
	pkg, err := packagejson.Read(a.Fs())
	if err != nil {
		return nil, err
	}

	return func(yield func(thecluster.Dependency) bool) {
		for k := range pkg.Depencencies {
			if ws, err := workspace.FromNpmPackage(a.root, k); err != nil {
				// This shouldn't be a warning, but it helps for visibility while a lot of this is WIP
				log.Warn("unable to load workspace from npm package", "package", k)
			} else if !yield(deps.FromWorkspace(ws)) {
				break
			}
		}
	}, nil
}

// Name implements thecluster.App.
func (a *app) Name() string {
	return a.name
}
