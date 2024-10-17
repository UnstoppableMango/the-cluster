package packagejson

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

type PackageJson struct {
	Name            string            `json:"name"`
	License         string            `json:"license"`
	PackageManager  string            `json:"packageManager"`
	Main            string            `json:"main"`
	Depencencies    map[string]string `json:"dependencies"`
	DevDependencies map[string]string `json:"devDependencies"`
}

func Read(fsys thecluster.Fs) (*PackageJson, error) {
	file, err := fsys.Open("package.json")
	if err != nil {
		return nil, fmt.Errorf("reading package.json: %w", err)
	}

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("reading package.json: %w", err)
	}

	var packageJson PackageJson
	if err = json.Unmarshal(data, &packageJson); err != nil {
		return nil, fmt.Errorf("reading package.json: %w", err)
	}

	return &packageJson, nil
}
