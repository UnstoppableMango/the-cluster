package main

import (
	"context"

	"github.com/UnstoppableMango/the-cluster/cmd/thecluster/cmd"
)

func main() {
	ctx := context.Background()
	cmd.Execute(ctx)
}
