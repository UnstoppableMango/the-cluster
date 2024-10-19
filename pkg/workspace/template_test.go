package workspace_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/testing"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Template", func() {
	Context("WriteTemplate", func() {
		It("should succeed", func() {
			t := &testing.Template{}

			writer := workspace.WriteTemplate(t, nil)

			Expect(writer).NotTo(BeNil())
		})
	})
})
