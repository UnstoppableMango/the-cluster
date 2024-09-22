package theclusterv1alpha1

import (
	"io/fs"
	"os"

	"github.com/spf13/afero"
	"sigs.k8s.io/kubebuilder/v4/pkg/config"
	"sigs.k8s.io/kubebuilder/v4/pkg/machinery"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugin"
	"sigs.k8s.io/kubebuilder/v4/pkg/plugins/golang/v4/scaffolds"
)

const (
	owner   = "UnstoppableMango"
	repo    = "github.com/unstoppablemango/the-cluster"
	license = "none"
)

type initSubcommand struct {
	config config.Config
}

// InjectConfig implements plugin.RequiresConfig.
func (i *initSubcommand) InjectConfig(c config.Config) error {
	i.config = c
	return i.config.SetRepository(repo)
}

// Scaffold implements plugin.InitSubcommand.
func (i *initSubcommand) Scaffold(fs machinery.Filesystem) error {
	init := scaffolds.NewInitScaffolder(i.config, license, owner)
	golangfs := afero.NewMemMapFs()
	init.InjectFS(machinery.Filesystem{FS: golangfs})

	err := init.Scaffold()
	if err != nil {
		return err
	}

	dirs := []string{"cmd/operator", "containers/operator", "test/e2e", "test/utils"}
	for _, d := range dirs {
		if err = fs.FS.MkdirAll(d, os.ModePerm); err != nil {
			return err
		}
	}

	w := golangWalker{golangfs, fs.FS}
	return afero.Walk(golangfs, ".", w.walk)
}

var _ plugin.InitSubcommand = &initSubcommand{}
var _ plugin.RequiresConfig = &initSubcommand{}

type golangWalker struct {
	source afero.Fs
	target afero.Fs
}

func (g *golangWalker) walk(path string, info fs.FileInfo, err error) error {
	if err != nil {
		return err
	}

	switch path {
	case "cmd/main.go":
		return g.copy(path, "cmd/operator/main.go")
	case "Makefile":
		return g.copy(path, "cmd/operator/generated.mk")
	case "test/e2e/e2e_test.go":
		return g.copy(path, "test/e2e/operator_e2e_test.go")
	case "Dockerfile":
		return g.copy(path, "containers/operator/Dockerfile")
	case ".dockerignore":
		return g.copy(path, "containers/operator/Dockerfile.dockerignore")
	case "test/utils/utils.go":
		fallthrough
	case "test/e2e/e2e_suite_test.go":
		return g.copy(path, path)
	}

	return nil
}

func (g *golangWalker) copy(source, target string) error {
	buf, err := afero.ReadFile(g.source, source)
	if err != nil {
		return err
	}

	return afero.WriteFile(g.target, target, buf, os.ModePerm)
}
