package thecluster_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/kubebuilder/plugins/thecluster"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
)

var _ = Describe("Options", func() {
	It("should set resource plural name", func() {
		opts := thecluster.Options{}
		res := resource.Resource{}

		Expect(res.Plural).To(Equal(opts.Plural))
	})
})
