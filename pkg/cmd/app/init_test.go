package app_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/cmd/app"
)

var _ = Describe("Init", func() {
	It("should initialize an app", func(ctx context.Context) {
		app.InitCmd.SetArgs([]string{"apps/init-test"})
		err := app.InitCmd.ExecuteContext(ctx)

		Expect(err).NotTo(HaveOccurred())
	})
})
