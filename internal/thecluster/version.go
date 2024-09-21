package thecluster

import (
	"os"
	"path"

	"github.com/unstoppablemango/the-cluster/internal/util"
)

func VersionFor(dep string) (string, error) {
	w, err := util.GitRoot()
	if err != nil {
		return "", err
	}

	b, err := os.ReadFile(path.Join(w, ".versions", dep))
	if err != nil {
		return "", err
	}

	return string(b), nil
}

func RequireVersionFor(dep string) string {
	v, err := VersionFor(dep)
	if err != nil {
		panic(err)
	}

	return v
}
