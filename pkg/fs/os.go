package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func ReadOnly() thecluster.Fs {
	return afero.NewReadOnlyFs(afero.NewOsFs())
}
