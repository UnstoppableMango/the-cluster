package app

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/template"
	tcfs "github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Init(ctx context.Context, repo thecluster.Fs, relativePath string) error {
	log := log.FromContext(ctx)
	root, err := tcfs.GitRoot(repo)
	if err != nil {
		return fmt.Errorf("unable to locate git root directory: %w", err)
	}

	templatePath := filepath.Join(root, template.RelativePath)
	template, err := template.Typescript()
	if err != nil {
		return fmt.Errorf("unable to load typescript template")
	}

	srcfs := tcfs.FromContext(ctx)
	walk := func(path string, info fs.FileInfo, err error) error {
		log.Debug("processing file", "path", path)
		target, err := filepath.Rel(templatePath, path)
		if err != nil {
			return fmt.Errorf("unable to create relative path: %w", err)
		}

		targetPath := filepath.Join(root, relativePath, target)
		if info.IsDir() {
			log.Debug("creating directory", "path", targetPath)
			return repo.Mkdir(targetPath, 0o700)
		}

		src, err := srcfs.Open(path)
		if err != nil {
			return fmt.Errorf("unable to open template source file")
		}

		dest, err := repo.Create(targetPath)
		if err != nil {
			return fmt.Errorf("unable to create file: %w", err)
		}

		log.Debug("copying template file", "path", path)
		if _, err = io.Copy(dest, src); err != nil {
			return fmt.Errorf("unable to copy template file: %w", err)
		}

		return nil
	}

	return afero.Walk(srcfs, template.Dir, walk)
}
