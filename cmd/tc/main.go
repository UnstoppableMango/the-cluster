package main

import (
	"context"

	"github.com/UnstoppableMango/the-cluster/cmd/deploy/cmd"
)

func main() {
	ctx := context.Background()
	cmd.Execute(ctx)
}
