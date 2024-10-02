package util

import (
	"fmt"
	"os/exec"
	"strings"
)

func GitRoot() (string, error) {
	out, err := exec.Command("git", "rev-parse", "--show-toplevel").Output()
	if err != nil {
		return "", fmt.Errorf("unable to execute git command: %w", err)
	}

	return strings.TrimSpace(string(out)), err
}

func RequireGitRoot() string {
	if root, err := GitRoot(); err != nil {
		panic(err)
	} else {
		return root
	}
}
