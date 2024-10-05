package workspace

import "github.com/unstoppablemango/the-cluster/pkg/thecluster"

type Workspace interface {
	Fs() thecluster.Fs
}
