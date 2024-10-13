package fs

import (
	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type MemoryWriter struct{ afero.Fs }

// Write implements Writer.
func (m *MemoryWriter) Write(thecluster.Fs) error {
	panic("unimplemented")
}

func NewMemMapped() Writer {
	return &MemoryWriter{afero.NewMemMapFs()}
}
