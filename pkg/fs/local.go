package fs

import (
	"fmt"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type LocalRepoFs struct {
	thecluster.Fs
	Root string
}

func LocalRepo() (*LocalRepoFs, error) {
	root, err := util.GitRoot()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve git root directory: %w", err)
	}

	return &LocalRepoFs{
		Fs:   afero.NewBasePathFs(afero.NewOsFs(), root),
		Root: root,
	}, nil
}
