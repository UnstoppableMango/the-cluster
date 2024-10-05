package app

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"text/template"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/pulumi"
	tcfs "github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type Initializer interface {
	Init(context.Context, string) (thecluster.Fs, error)
}

type tmplData struct {
	Project     string
	Description string
}

func Init(ctx context.Context, repo thecluster.Fs, relativePath string) error {
	log := log.FromContext(ctx)
	root, err := tcfs.GitRoot(repo)
	if err != nil {
		return fmt.Errorf("unable to locate git root directory: %w", err)
	}

	templatePath := filepath.Join(root, pulumi.TypescriptRelativePath)
	srcfs := tcfs.FromContext(ctx)
	walk := func(path string, info fs.FileInfo, err error) error {
		log.Debug("processing file", "path", path)
		if err != nil {
			return fmt.Errorf("unsupported path error: %w", err)
		}

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

		srcText, err := io.ReadAll(src)
		if err != nil {
			return fmt.Errorf("unable to read source file: %w", err)
		}

		tmpl, err := template.New(path).Parse(string(srcText))
		if err != nil {
			return fmt.Errorf("unable to create template: %w", err)
		}

		dest, err := repo.Create(targetPath)
		if err != nil {
			return fmt.Errorf("unable to create file: %w", err)
		}

		name := filepath.Base(relativePath)
		data := tmplData{name, "install for THECLUSTER"}

		log.Debug("executing and writing template", "path", path)
		if err = tmpl.Execute(dest, data); err != nil {
			return fmt.Errorf("unable to copy template file: %w", err)
		}

		return nil
	}

	template, err := pulumi.TypescriptTemplate()
	if err != nil {
		return fmt.Errorf("unable to load typescript template: %w", err)
	}

	return afero.Walk(srcfs, template.Dir, walk)
}
