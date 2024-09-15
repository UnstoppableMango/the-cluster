package thecluster_test

import (
	"testing"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestThecluster(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Thecluster Suite")
}
