package workspace

import (
	"fmt"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func FromNpmPackage(fsys thecluster.Fs, name string) (thecluster.Workspace, error) {
	switch name {
	case "@unstoppablemango/thecluster":
		return At(fsys, "lib/nodejs"), nil
	case "@unstoppablemango/thecluster-crds":
		return At(fsys, "lib/crds/nodejs"), nil
	default:
		return nil, fmt.Errorf("unsupported package: %s", name)
	}
}
