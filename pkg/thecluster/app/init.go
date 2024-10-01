package app

import (
	"context"
	"fmt"
	"io/fs"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/template"
	tcfs "github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Init(ctx context.Context, repo thecluster.Fs, directory string) error {
	log := log.FromContext(ctx)
	template, err := template.Typescript()
	if err != nil {
		return fmt.Errorf("unable to load typescript template")
	}

	walk := func(path string, info fs.FileInfo, err error) error {
		log.Debug("processing file", "path", path)

		return nil
	}

	return afero.Walk(tcfs.FromContext(ctx), template.Dir, walk)
}
