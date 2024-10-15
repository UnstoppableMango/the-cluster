package deps

import (
	"github.com/unstoppablemango/the-cluster/pkg/packagejson"
	"github.com/unstoppablemango/the-cluster/pkg/thecluster"
)

func PackageJson(fsys thecluster.Fs) (map[string]string, error) {
	data, err := packagejson.Read(fsys)
	if err != nil {
		return nil, err
	}

	return data.Depencencies, nil
}
