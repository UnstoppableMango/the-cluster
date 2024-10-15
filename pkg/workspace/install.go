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
	if dependent, ok := ws.(thecluster.Dependent); ok {
		for d := range dependent.Dependencies() {
			if err := InstallDeps(ctx, d.Workspace(), options...); err != nil {
				return fmt.Errorf("installing dependency at %s: %w", d.Workspace().Path(), err)
			}
		}
	}

	pulumi, err := LoadPulumi(ctx, ws)
	if err != nil {
		return fmt.Errorf("loading pulumi workspace: %w", err)
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
