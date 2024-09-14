package app

import (
	"fmt"
	"path/filepath"
)

func (m *Model) displayPaths() ([]string, error) {
	paths := make([]string, 0, len(m.workspaces))
	for i, w := range m.workspaces {
		p := w.WorkingDirectory

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
