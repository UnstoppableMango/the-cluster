package thecluster

import "os"

type Config struct {
	CI          bool
	Root        string
	RootModules []string
	Interactive bool
}

func NewConfig(root string) Config {
	ci := os.Getenv("CI") != ""

	return Config{
		CI:          ci,
		Root:        root,
		RootModules: []string{},
		Interactive: false,
	}
}
