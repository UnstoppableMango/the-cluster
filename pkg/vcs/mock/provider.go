package mock

import "github.com/unstoppablemango/the-cluster/pkg/vcs"

type MockSourceControlProvider struct{}

var _ vcs.SourceControlProvider = &MockSourceControlProvider{}

func New() *MockSourceControlProvider {
	return &MockSourceControlProvider{}
}
