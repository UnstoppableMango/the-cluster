package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func NewMemMapped() thecluster.WritableFs {
	return afero.NewMemMapFs()
}
