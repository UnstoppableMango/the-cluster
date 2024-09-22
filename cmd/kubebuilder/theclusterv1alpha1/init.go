package theclusterv1alpha1

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"github.com/spf13/afero"
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4/scaffolds"
)

const (
	owner = "UnstoppableMango"
	repo  = "github.com/unstoppablemango/the-cluster"
)

type initSubcommand struct {
	config config.Config
}

// InjectConfig implements plugin.RequiresConfig.
func (i *initSubcommand) InjectConfig(c config.Config) error {
	i.config = c
	return i.config.SetRepository(repo)
}

// PreScaffold implements plugin.HasPreScaffold.
func (i *initSubcommand) PreScaffold(machinery.Filesystem) error {
	return checkDir()
}

func walk(path string, info fs.FileInfo, err error) error {
	_, err = fmt.Fprintln(os.Stderr, info.Name())
	return err
}

// Scaffold implements plugin.InitSubcommand.
func (i *initSubcommand) Scaffold(fs machinery.Filesystem) error {
	init := scaffolds.NewInitScaffolder(i.config, "", owner)
	init.InjectFS(fs)

	err := init.Scaffold()
	if err != nil {
		return err
	}

	fmt.Fprintln(os.Stderr, "walking dirs")
	return afero.Walk(fs.FS, ".", walk)
	// return fs.FS.Rename("cmd/main.go", "cmd/operator/main.go")
}

var _ plugin.InitSubcommand = &initSubcommand{}
var _ plugin.RequiresConfig = &initSubcommand{}
var _ plugin.HasPreScaffold = &initSubcommand{}

func checkDir() error {
	err := filepath.Walk(".",
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if info.IsDir() && strings.HasPrefix(info.Name(), ".") && info.Name() != "." {
				return filepath.SkipDir
			}
			if strings.HasPrefix(info.Name(), ".") {
				return nil
			}
			if strings.HasSuffix(info.Name(), ".md") && !info.IsDir() {
				return nil
			}
			isCapitalized := true
			for _, l := range info.Name() {
				if !unicode.IsUpper(l) {
					isCapitalized = false
					break
				}
			}
			if isCapitalized && info.Name() != "PROJECT" {
				return nil
			}
			allowedFiles := []string{
				"go.mod",
				"go.sum",
				"Makefile",
				"buf.gen.yaml",
				"buf.lock",
				"buf.yaml",
				"global.json",
				"UnMango.TheCluster.sln",
				"UnMango.TheCluster.sln.DotSettings",
			}
			for _, allowedFile := range allowedFiles {
				if info.Name() == allowedFile {
					return nil
				}
			}

			// return nil
			return fmt.Errorf(
				"target directory is not empty (only %s, files and directories with the prefix \".\", "+
					"files with the suffix \".md\" or capitalized files name are allowed); "+
					"found existing file %q", strings.Join(allowedFiles, ", "), path)
		})
	if err != nil {
		return err
	}

	return nil
}
