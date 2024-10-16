package template

import (
	"github.com/unmango/go/iter"
	"github.com/unmango/go/iter/seqs"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

// List lists all valid templates that can be discovered at path
// and ignores any templates that produce errors.
func List(workspace thecluster.Fs, options ...DiscoverOption) iter.Seq[thecluster.TemplateGroup] {
	return seqs.FilterR(Discover(workspace, options...))
}
