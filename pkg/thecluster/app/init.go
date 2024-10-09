package app

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"text/template"

	"github.com/charmbracelet/log"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/pulumi"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster/workspace"
)

type Initializer interface {
	Init(context.Context, string) (thecluster.Fs, error)
}

type tmplData struct {
	Project     string
	Description string
}

func Init(ws thecluster.Workspace, appPath string) (thecluster.Workspace, error) {
	ws = workspace.Edit(ws)
	repo := ws.Fs()

	templatePath, err := workspace.PathTo(ws, pulumi.TypescriptRelativePath)
	if err != nil {
		return nil, fmt.Errorf("unable to create relative path to templates: %w", err)
	}

	if filepath.IsAbs(appPath) {
		log.Debug("creating app directory", "path", appPath)
		if err = repo.MkdirAll(appPath, os.ModeDir); err != nil {
			return nil, fmt.Errorf("unable to create app directory: %w", err)
		}
	}

	walk := func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}

		log.Debug("processing file", "path", path)
		target, err := filepath.Rel(templatePath, path)
		if err != nil {
			return fmt.Errorf("unable to create relative path: %w", err)
		}

		var targetPath string
		if filepath.IsAbs(appPath) {
			log.Debug("path is abs", "path", appPath)
			targetPath = filepath.Join(appPath, target)
		} else {
			log.Debug("path is NOT abs", "path", appPath)
			if targetPath, err = workspace.PathTo(ws, appPath, target); err != nil {
				return fmt.Errorf("unable to create relative path to target: %w", err)
			}
		}

		if info.IsDir() {
			log.Debug("creating directory", "path", targetPath)
			return repo.Mkdir(targetPath, os.ModeDir)
		}

		src, err := repo.Open(path)
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

		name := filepath.Base(appPath)
		data := tmplData{name, "install for THECLUSTER"}

		log.Debug("executing and writing template", "path", path)
		if err = tmpl.Execute(dest, data); err != nil {
			return fmt.Errorf("unable to copy template file: %w", err)
		}

		return nil
	}

	template, err := pulumi.TypescriptTemplate()
	if err != nil {
		return nil, fmt.Errorf("unable to load typescript template: %w", err)
	}

	return ws, afero.Walk(repo, template.Dir, walk)
}
