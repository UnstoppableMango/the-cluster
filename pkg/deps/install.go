package deps

import (
	"context"
	"errors"
	"fmt"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/unstoppablemango/the-cluster/internal/option"
	"github.com/unstoppablemango/the-cluster/pkg/pulumi"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Install(ctx context.Context, ws thecluster.Workspace, options ...thecluster.InstallOption) error {
	pulumi, err := pulumi.LoadWorkspace(ctx, ws)
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
