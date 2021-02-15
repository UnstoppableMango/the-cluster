package main

import (
	k8s "github.com/pulumi/pulumi-kubernetes/sdk/v2/go/kubernetes/apps/v1"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi"
)

// CodeServerArgs Arguments for creating a CodeServer resource
type CodeServerArgs struct {
	projectID string
	namespace string
}

// CodeServer resource
type CodeServer struct {
	pulumi.ResourceState
	deployment k8s.Deployment
}

// NewCodeServer Create a new CodeServer component resource
func NewCodeServer(ctx *pulumi.Context, name string, args *CodeServerArgs, opts ...pulumi.ResourceOption) (*CodeServer, error) {
	codeServer := &CodeServer{}
	err := ctx.RegisterComponentResource("unmango:apps:code-server", name, codeServer, opts...)
	if err != nil {
		return nil, err
	}
	return codeServer, nil
}
