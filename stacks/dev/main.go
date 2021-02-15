package main

import (
	resources "github.com/UnstoppableMango/the-cluster/stacks/dev/resources"

	"github.com/pulumi/pulumi-rancher2/sdk/v2/go/rancher2"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		project, err := rancher2.NewProject(ctx, "dev", &rancher2.ProjectArgs{
			ClusterId: pulumi.String("local"),
		})

		codeServer, err := resources.NewCodeServer(ctx, "code-server", &resources.CodeServerArgs{
			projectID: project.ID(),
		})

		if err != nil {
			return err
		}

		return nil
	})
}
