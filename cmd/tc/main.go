package main

import (
	"context"

	"github.com/UnstoppableMango/the-cluster/cmd/tc/cmd"
)

func main() {
	ctx := context.Background()
	cmd.Execute(ctx)
}
