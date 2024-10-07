package template

import (
	"io"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Execute(template thecluster.Template, state any) thecluster.Fs {
	result := afero.NewMemMapFs()
	for f := range template.Files() {
		_ = f.Execute(io.Discard, state)
	}

	return result
}
