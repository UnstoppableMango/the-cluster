package workspace

import "github.com/pulumi/pulumi/sdk/v3/go/auto"

// I really don't like this, but it gets the job done for now

type PulumiSupporter interface {
	Pulumi() auto.Workspace
}
