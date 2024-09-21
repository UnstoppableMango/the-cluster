package util

import (
	"os/exec"
	"strings"
)

func GitRoot() (string, error) {
	out, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(out)), err
}

func RequireGitRoot() string {
	root, err := GitRoot()
	if err != nil {
		panic(err)
	}

	return root
}
