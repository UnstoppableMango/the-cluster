package fs_test

import (
	"io/fs"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	tcfs "github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("Iter", func() {
	Context("Iter", func() {
		var mock thecluster.Fs

		BeforeEach(func() {
			mock = afero.NewMemMapFs()
			Expect(mock.Create("temp1.txt")).NotTo(BeNil())
			Expect(mock.Create("temp2.txt")).NotTo(BeNil())
		})

		It("should iterate over files", func() {
			seq := tcfs.Iter(mock, "")

			bucket := []string{}
			seq(func(path string, info fs.FileInfo, err error) bool {
				bucket = append(bucket, path)
				return true
			})
			// The empty string represents the root directory
			Expect(bucket).To(HaveExactElements("", "temp1.txt", "temp2.txt"))
		})

		It("should stop when yield returns false", func() {
			seq := tcfs.Iter(mock, "")

			bucket := []string{}
			seq(func(path string, info fs.FileInfo, err error) bool {
				bucket = append(bucket, path)
				return false
			})
			// The empty string represents the root directory
			Expect(bucket).To(HaveExactElements(""))
		})
	})
})
