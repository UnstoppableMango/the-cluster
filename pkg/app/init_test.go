package app_test

import (
	"context"
	"io"
	"path/filepath"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/internal/util"
	"github.com/unstoppablemango/the-cluster/pkg/app"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
	"github.com/unstoppablemango/the-cluster/pkg/workspace"
)

var _ = Describe("Init", func() {
	var (
		actual        thecluster.App
		mockWs        thecluster.Workspace
		root          string
		mockDirectory = "some/dir"
	)

	BeforeEach(func() {
		var err error
		root, err = util.GitRoot()
		Expect(err).NotTo(HaveOccurred())

		mockWs, err = workspace.NewLocalGit()
		Expect(err).NotTo(HaveOccurred())
	})

	JustBeforeEach(func(ctx context.Context) {
		var err error
		actual, err = app.Init(mockWs, mockDirectory)
		Expect(err).NotTo(HaveOccurred())
		Expect(actual).NotTo(BeNil())
	})

	It("should create the app directory", func() {
		Expect(actual.Path()).To(Equal(mockDirectory))
		d, err := actual.Fs().Stat("")
		Expect(err).NotTo(HaveOccurred())
		Expect(d.IsDir()).To(BeTrueBecause("the directory was created"))
	})

	DescribeTable("all template files",
		Entry("Pulumi.yaml", "Pulumi.yaml"),
		Entry("config.ts", "config.ts"),
		Entry("index.ts", "index.ts"),
		Entry(".helmignore", ".helmignore"),
		Entry("Chart.yaml", "Chart.yaml"),
		Entry("package.json", "package.json"),
		Entry("tsconfig.json", "tsconfig.json"),
		func(file string) {
			f, err := actual.Fs().Open(file)
			Expect(err).NotTo(HaveOccurred())

			stat, err := f.Stat()
			Expect(err).NotTo(HaveOccurred())
			Expect(stat.IsDir()).To(BeFalseBecause("a file was expected"))
		},
	)

	It("should template Pulumi.yaml", Pending, func() {
		Expect(afero.FileContainsBytes(actual.Fs(), "Pulumi.yaml", []byte("dir"))).To(BeTrue())
		// f, err := actual.Fs().Open("Pulumi.yaml")
		// Expect(err).NotTo(HaveOccurred())

		// contents, err := io.ReadAll(f)
		// Expect(err).NotTo(HaveOccurred())
		// Expect(string(contents)).To(ContainSubstring("dir"))
	})

	It("should template index.ts", Pending, func() {
		f, err := actual.Fs().Open("index.ts")
		Expect(err).NotTo(HaveOccurred())

		contents, err := io.ReadAll(f)
		Expect(err).NotTo(HaveOccurred())
		Expect(string(contents)).To(ContainSubstring("dir"))
	})

	Context("project name", Pending, func() {
		BeforeEach(func() {
			mockDirectory = "expected/project-name"
		})

		It("should use the base directory as the App name", func() {
			f, err := actual.Fs().Open("Pulumi.yaml")
			Expect(err).NotTo(HaveOccurred())

			contents, err := io.ReadAll(f)
			Expect(err).NotTo(HaveOccurred())
			Expect(string(contents)).To(ContainSubstring("project-name"))
		})
	})

	Context("rooted directory", func() {
		BeforeEach(func() {
			mockDirectory = filepath.Join(root, "apps", mockDirectory)
		})

		It("should attempt to make the path relative", func() {
			d, err := actual.Fs().Stat("")
			Expect(err).NotTo(HaveOccurred())
			Expect(d.IsDir()).To(BeTrueBecause("the directory was created"))
		})
	})
})
