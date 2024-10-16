package npm

import (
	"context"
	"io"
	"os/exec"

	"github.com/charmbracelet/log"
	"github.com/unmango/go/option"
)

type NpmOptions struct {
	logger           *log.Logger
	stdout, stderr   io.Writer
	workingDirectory string
}

type NpmOption func(*NpmOptions)

func WithStderr(writer io.Writer) NpmOption {
	return func(options *NpmOptions) {
		options.stderr = writer
	}
}

func WithStdout(writer io.Writer) NpmOption {
	return func(options *NpmOptions) {
		options.stdout = writer
	}
}

func WithWorkingDirectory(directory string) NpmOption {
	return func(options *NpmOptions) {
		options.workingDirectory = directory
	}
}

func Command(ctx context.Context, args ...string) *exec.Cmd {
	return exec.CommandContext(ctx, "npm", args...)
}

func Run(command *exec.Cmd, options ...NpmOption) error {
	opts := &NpmOptions{}
	option.ApplyAll(opts, options)

	command.Dir = opts.workingDirectory
	command.Stdout = opts.stdout
	command.Stderr = opts.stderr

	opts.logger.Info("running npm command",
		"cmd", command.String(),
		"workDir", command.Dir,
	)
	return command.Run()
}

func Ci(ctx context.Context, options ...NpmOption) error {
	options = append(options, withLogger(ctx))
	return Run(Command(ctx, "ci"), options...)
}

func Install(ctx context.Context, options ...NpmOption) error {
	options = append(options, withLogger(ctx))
	return Run(Command(ctx, "install"), options...)
}

func withLogger(ctx context.Context) NpmOption {
	return func(options *NpmOptions) {
		options.logger = log.FromContext(ctx)
	}
}
