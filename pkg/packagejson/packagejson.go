package packagejson

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/spf13/afero"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

const (
	CanonicalName = "package.json"
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
	data, err := afero.ReadFile(fsys, CanonicalName)
	if err != nil {
		return nil, fmt.Errorf("reading package.json: %w", err)
	}

	var packageJson PackageJson
	if err = json.Unmarshal(data, &packageJson); err != nil {
		return nil, fmt.Errorf("reading package.json: %w", err)
	}

	return &packageJson, nil
}

func Write(fsys thecluster.Fs, pack PackageJson) error {
	data, err := json.Marshal(pack)
	if err != nil {
		return err
	}

	return afero.WriteFile(fsys, CanonicalName, data, os.ModePerm)
}
