package template

import (
	"fmt"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func Execute(template thecluster.Template, state any) (thecluster.Fs, error) {
	result := afero.NewMemMapFs()
	for f := range template.Files() {
		if err := f.Execute(result, state); err != nil {
			return nil, fmt.Errorf("execute template file: %w", err)
		}
	}

	return result, nil
}
