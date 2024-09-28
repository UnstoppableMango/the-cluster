package github

import "github.com/unstoppablemango/the-cluster/pkg/vcs"

type GitHubProvider struct{}

var _ vcs.SourceControlProvider = &GitHubProvider{}

func New() *GitHubProvider {
	return &GitHubProvider{}
}
