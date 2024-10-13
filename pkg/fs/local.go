package fs

import (
	"fmt"

	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type LocalRepoFs struct {
	thecluster.Fs
	root string
}

func (fsys *LocalRepoFs) Root() string {
	return fsys.root
}

func LocalRepo() (*LocalRepoFs, error) {
	root, err := util.GitRoot()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve git root directory: %w", err)
	}

	return &LocalRepoFs{
		Fs:   New(WithRoot(root)),
		root: root,
	}, nil
}

func GitRoot(fs thecluster.Fs) (string, error) {
	if repo, ok := fs.(*LocalRepoFs); ok {
		return repo.root, nil
	}

	return util.GitRoot()
}
