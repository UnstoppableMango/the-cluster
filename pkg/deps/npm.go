package deps

import (
	"context"
	"errors"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type NpmDependency struct {
	Name    string
	Version string
}

func (d *NpmDependency) Install(ctx context.Context) error {
	return errors.New("unimplemented")
}

func IsNpm(ws thecluster.Workspace) (bool, error) {
	return afero.Exists(ws.Fs(), "package-lock.json")
}
