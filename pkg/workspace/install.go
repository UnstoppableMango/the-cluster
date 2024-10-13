package workspace

import (
	"context"
	"errors"
	"fmt"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/option"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type InstallOption func(*auto.InstallOptions)

func InstallDeps(ctx context.Context, ws thecluster.Workspace, options ...InstallOption) error {
	var pulumi auto.Workspace
	if p, ok := ws.(PulumiSupporter); !ok {
		return errors.New("pulumi not supported")
	} else {
		pulumi = p.Pulumi()
	}

	isNpm, err := IsNpm(ws)
	if err != nil {
		return fmt.Errorf("checking package manager: %w", err)
	}
	if !isNpm {
		return errors.New("not an npm workspace")
	}

	opts := &auto.InstallOptions{}
	option.ApplyAll(opts, options)

	return pulumi.Install(ctx, opts)
}

func IsNpm(ws thecluster.Workspace) (bool, error) {
	return afero.Exists(ws.Fs(), "package-lock.json")
}
