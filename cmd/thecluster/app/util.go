package app

import (
	"fmt"
	"maps"
	"path/filepath"
	"slices"

	tc "github.com/unstoppablemango/the-cluster/gen/go/io/unmango/thecluster/v1alpha1"
)

func workspacePaths(w map[string]*tc.Workspace) []string {
	result := make([]string, 0, len(w))
	for k := range w {
		result = append(result, k)
	}
	return result
}

func (m model) displayPaths() ([]string, error) {
	paths := make([]string, 0, len(m.workspaces))
	for i, p := range slices.Sorted(maps.Keys(m.workspaces)) {
		if m.rootDir != "" {
			rel, err := filepath.Rel(m.rootDir, p)
			if err != nil {
				return nil, err
			}

			p = rel
		}

		if i == m.cursor {
			p = fmt.Sprintf("[X] %s", p)
		} else {
			p = fmt.Sprintf("[ ] %s", p)
		}

		paths = append(paths, p)
	}

	return paths, nil
}
