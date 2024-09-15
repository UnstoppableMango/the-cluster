package thecluster_test

import (
	"context"
	"os/exec"
	"strings"
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var gitRoot string

func TestThecluster(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Thecluster Suite")
}

var _ = BeforeSuite(func(ctx context.Context) {
	wd, err := exec.CommandContext(ctx,
		"git", "rev-parse", "--show-toplevel",
	).Output()
	Expect(err).NotTo(HaveOccurred())
	gitRoot = strings.TrimSpace(string(wd))
})
