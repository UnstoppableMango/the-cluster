package workspace

import "github.com/pulumi/pulumi/sdk/v3/go/auto"

type PulumiSupporter interface {
	Pulumi() auto.Workspace
}
