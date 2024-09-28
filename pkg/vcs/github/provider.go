package github

import (
	"github.com/google/go-github/v65/github"
	"github.com/unstoppablemango/the-cluster/pkg/vcs"
)

type GitHubProvider struct {
	*github.Client
}

var _ vcs.SourceControlProvider = &GitHubProvider{}

func New() *GitHubProvider {
	return &GitHubProvider{}
}
