package app_test

import (
	"context"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/charmbracelet/log"
	"github.com/unstoppablemango/the-cluster/pkg/cmd/app"
)

var _ = Describe("Init", Label("E2E"), func() {
	It("should initialize an app", Pending, func(ctx context.Context) {
		log.SetLevel(log.ErrorLevel)
		app.InitCmd.SetArgs([]string{"apps/init-test"})
		err := app.InitCmd.ExecuteContext(ctx)

		Expect(err).NotTo(HaveOccurred())
	})
})
