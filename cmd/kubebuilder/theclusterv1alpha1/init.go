package theclusterv1alpha1

import (
	"os"
	"path/filepath"
	"strings"
	"unicode"

	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	golangv4 "sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4"
)

const (
	repo = "github.com/unstoppablemango/the-cluster"
)

type initSubcommand struct {
	golang golangv4.Plugin
	config config.Config
}

// InjectConfig implements plugin.RequiresConfig.
func (i *initSubcommand) InjectConfig(c config.Config) error {
	i.golang = golangv4.Plugin{}
	i.config = c
	return i.config.SetRepository(repo)
}

// PreScaffold implements plugin.HasPreScaffold.
func (i *initSubcommand) PreScaffold(machinery.Filesystem) error {
	return checkDir()
}

// Scaffold implements plugin.InitSubcommand.
func (i *initSubcommand) Scaffold(fs machinery.Filesystem) error {
	// c := i.golang.GetInitSubcommand()
	// err := c.Scaffold(fs)
	// if err != nil {
	// 	return err
	// }

	return nil
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
			}
			for _, allowedFile := range allowedFiles {
				if info.Name() == allowedFile {
					return nil
				}
			}

			return nil
			// return fmt.Errorf(
			// 	"target directory is not empty (only %s, files and directories with the prefix \".\", "+
			// 		"files with the suffix \".md\" or capitalized files name are allowed); "+
			// 		"found existing file %q", strings.Join(allowedFiles, ", "), path)
		})
	if err != nil {
		return err
	}

	return nil
}
