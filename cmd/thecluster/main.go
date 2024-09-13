package main

import (
	"context"

	"github.com/unstoppablemango/the-cluster/cmd/thecluster/cmd"
)

func main() {
	ctx := context.Background()
	cmd.Execute(ctx)
}
