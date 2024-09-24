package thecluster_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/unstoppablemango/the-cluster/pkg/kubebuilder/plugins/thecluster"
	"sigs.k8s.io/kubebuilder/v4/pkg/model/resource"
)

var _ = Describe("Options", func() {
	DescribeTable("resource plural name",
		Entry("should keep existing name", "", "existing", "existing"),
		Entry("should overwrite existing name", "overwrite", "existing", "overwrite"),
		func(o, r, expected string) {
			opts := thecluster.Options{Plural: o}
			res := &resource.Resource{Plural: r}

			opts.UpdateResource(res, nil)

			Expect(res.Plural).To(Equal(expected))
		},
	)
})
