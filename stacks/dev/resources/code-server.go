package resources

import (
	k8s "github.com/pulumi/pulumi-kubernetes/sdk/v2/go/kubernetes/apps/v1"
	meta "github.com/pulumi/pulumi-kubernetes/sdk/v2/go/kubernetes/meta/v1"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi"
)

// CodeServerArgs Arguments for creating a CodeServer resource
type CodeServerArgs struct {
	ProjectID string
	Namespace string
}

// CodeServer resource
type CodeServer struct {
	pulumi.ResourceState
	Deployment k8s.Deployment
}

// NewCodeServer Create a new CodeServer component resource
func NewCodeServer(ctx *pulumi.Context, name string, args *CodeServerArgs, opts ...pulumi.ResourceOption) (*CodeServer, error) {
	deployment, err := k8s.NewDeployment(ctx, "code-server", &k8s.DeploymentArgs{
		Metadata: &meta.ObjectMetaArgs{
			Namespace: pulumi.String(args.Namespace),
		},
	})
	if err != nil {
		return nil, err
	}

	codeServer := &CodeServer{
		Deployment: *deployment,
	}

	err = ctx.RegisterComponentResource("unmango:apps:code-server", name, codeServer, opts...)
	if err != nil {
		return nil, err
	}

	err = ctx.RegisterResourceOutputs(codeServer, pulumi.Map{
		"deployment": &codeServer.Deployment,
	})
	if err != nil {
		return nil, err
	}

	return codeServer, nil
}
