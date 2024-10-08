package fs_test

import (
	"os"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/fs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

var _ = Describe("Copy", func() {
	var src, dest thecluster.Fs

	BeforeEach(func() {
		src = afero.NewMemMapFs()
		dest = afero.NewMemMapFs()
	})

	JustBeforeEach(func() {
		Expect(fs.Copy(src, dest)).To(Succeed())
	})

	It("should work", func() {
		_, err := fs.FailFast(fs.Iter(src, ""))
		Expect(err).NotTo(HaveOccurred())
	})

	Context("when a file exists", func() {
		var testFile string

		BeforeEach(func() {
			testFile = "test.txt"
			Expect(src.Create(testFile)).NotTo(BeNil())
		})

		It("should copy files", func() {
			fileCount := 0

			files, err := fs.FailFast(fs.Iter(src, ""))
			Expect(err).NotTo(HaveOccurred())
			for p, i := range files {
				if p == "" {
					continue
				}

				fileCount++
				Expect(p).To(Equal(testFile))
				Expect(i.IsDir()).To(BeFalseBecause("test.txt is a file"))
				Expect(afero.Exists(dest, p)).To(BeTrueBecause("the file exists"))
			}

			Expect(fileCount).To(Equal(1))
		})
	})

	Context("when a directory exists", func() {
		var testDir string

		BeforeEach(func() {
			testDir = "test-dir"
			Expect(src.Mkdir(testDir, os.ModeDir)).To(Succeed())
		})

		It("should copy dirs", func() {
			dirCount := 0

			files, err := fs.FailFast(fs.Iter(src, ""))
			Expect(err).NotTo(HaveOccurred())
			for p, i := range files {
				if p == "" {
					continue
				}

				dirCount++
				Expect(p).To(Equal(testDir))
				Expect(i.IsDir()).To(BeTrueBecause("test-dir is a dir"))
				Expect(afero.DirExists(dest, p)).To(BeTrueBecause("the dir exists"))
			}

			Expect(dirCount).To(Equal(1))
		})
	})
})
