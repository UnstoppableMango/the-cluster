package fs_test

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	"github.com/charmbracelet/log"
)

func TestFs(t *testing.T) {
	log.SetLevel(log.ErrorLevel)

	RegisterFailHandler(Fail)
	RunSpecs(t, "Fs Suite")
}
