package app_test

import (
	"testing"

	"github.com/charmbracelet/log"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestApp(t *testing.T) {
	log.SetLevel(log.DebugLevel)

	RegisterFailHandler(Fail)
	RunSpecs(t, "App Suite")
}
