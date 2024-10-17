package thecluster

import (
	"context"

	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/unmango/go/iter"
)

type InstallOption func(*auto.InstallOptions)

type Dependency interface {
	Install(context.Context) error
}

type Dependent interface {
	Dependencies() (iter.Seq[Dependency], error)
}
