package scanner_test

import (
	"bytes"
	"fmt"
	"strings"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/unstoppablemango/the-cluster/cmd/thecluster/components/scanner"
)

var _ = Describe("Model", func() {
	It("should initialize an empty scanner", func() {
		buf := &bytes.Buffer{}
		s := scanner.New(buf)

		cmd := s.Init()

		Expect(cmd()).To(Equal(scanner.Eof{}))
	})

	It("should return text", func() {
		expectedText := "some text here"
		buf := strings.NewReader(expectedText)
		s := scanner.New(buf)

		cmd := s.Init()

		Expect(cmd()).To(Equal(scanner.Line(expectedText)))
	})

	It("should read lines", func() {
		a, b := "first text", "second text"
		buf := strings.NewReader(fmt.Sprintf("%s\n%s", a, b))
		s := scanner.New(buf)

		cmd := s.Init()

		Expect(cmd()).To(Equal(scanner.Line(a)))
	})
})
