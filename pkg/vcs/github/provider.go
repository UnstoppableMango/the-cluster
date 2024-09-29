package github

import (
	"fmt"
	"net/http"

	"github.com/bradleyfalzon/ghinstallation/v2"
	"github.com/google/go-github/v65/github"
	"github.com/unstoppablemango/the-cluster/pkg/vcs"
)

type GitHubProvider struct {
	*github.Client
}

type Option func(*GitHubProvider)

func (o Option) apply(provider *GitHubProvider) {
	o(provider)
}

var _ vcs.SourceControlProvider = &GitHubProvider{}

func New(options ...Option) *GitHubProvider {
	client := github.NewClient(nil)
	provider := &GitHubProvider{
		Client: client,
	}
	for _, opt := range options {
		opt.apply(provider)
	}

	return provider
}

func WithAuthToken(token string) Option {
	return func(ghp *GitHubProvider) {
		ghp.Client = ghp.Client.WithAuthToken(token)
	}
}

func WithAppsTransport(appID int64, privateKey []byte) Option {
	transport, err := ghinstallation.NewAppsTransport(http.DefaultTransport, appID, privateKey)
	if err != nil {
		// TODO: Handle this better
		panic(fmt.Sprintf("unable to create apps transport: %v", err))
	}

	return func(ghp *GitHubProvider) {
		ghp.Client = github.NewClient(&http.Client{
			Transport: transport,
		})
	}
}
