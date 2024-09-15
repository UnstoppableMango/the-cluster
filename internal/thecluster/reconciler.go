package thecluster

import (
	"context"

	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

type Reconciler struct {
	Config Config
}

func (r Reconciler) Reconcile(ctx context.Context, req *tc.ReconcileRequest) (*tc.ReconcileResponse, error) {
	return &tc.ReconcileResponse{}, nil
}
