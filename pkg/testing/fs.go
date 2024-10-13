package testing

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type MockFs struct {
	thecluster.WritableFs
}

func (fsys *MockFs) Fs() thecluster.Fs {
	return afero.NewIOFS(fsys)
}

func NewMockFs() *MockFs {
	return &MockFs{
		WritableFs: afero.NewMemMapFs(),
	}
}
