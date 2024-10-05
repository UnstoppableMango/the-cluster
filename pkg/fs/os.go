package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func ReadOnly() thecluster.Fs {
	// TODO: Base path fs?
	return afero.NewReadOnlyFs(afero.NewOsFs())
}
