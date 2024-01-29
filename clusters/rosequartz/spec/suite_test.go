package spec

import (
	"context"
	"os"
	"testing"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi/sdk/v3/go/auto"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optdestroy"
	"github.com/pulumi/pulumi/sdk/v3/go/auto/optup"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
	"github.com/stretchr/testify/assert"
)

func TestHappy(t *testing.T) {
	deployFunc := func(ctx *pulumi.Context) error {
		image, err := docker.NewRemoteImage(ctx, "talos", &docker.RemoteImageArgs{
			Name:        pulumi.String("ghcr.io/siderolabs/talos:v1.6.1"), // TODO: Put in a place renovate can find it
			KeepLocally: pulumi.Bool(true),
		})
		if err != nil {
			return err
		}

		_, err = docker.NewContainer(ctx, "talos", &docker.ContainerArgs{
			Image: image.RepoDigest,
			Envs: pulumi.ToStringArray([]string{
				"PLATFORM=container",
				"TALOSSKU=2CPU-2048RAM",
				"PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
			}),
			Labels: &docker.ContainerLabelArray{
				&docker.ContainerLabelArgs{
					Label: pulumi.String("org.opencontainers.image.source"),
					Value: pulumi.String("https://github.com/siderolabs/talos"),
				},
			},
		})
		if err != nil {
			return err
		}

		return nil
	}

	ctx := context.Background()

	stack, err := auto.UpsertStackInlineSource(ctx, "e2e", "rq-deps", deployFunc)
	assert.NoError(t, err)

	err = stack.Workspace().InstallPlugin(ctx, "docker", "v4.5.1") // TODO: Put in a place renovate can find it
	assert.NoError(t, err)

	upStdout := optup.ProgressStreams(os.Stdout)
	_, err = stack.Up(ctx, upStdout)
	assert.NoError(t, err)

	//cwd, _ := os.Getwd()
	//integration.ProgramTest(
	//	t, &integration.ProgramTestOptions{
	//		Quick:       true,
	//		SkipRefresh: true,
	//		Dir:         path.Join(cwd, "../"),
	//		Config: map[string]string{
	//			"caStack": "dev",
	//		},
	//	},
	//)

	destroyStdout := optdestroy.ProgressStreams(os.Stdout)
	_, err = stack.Destroy(ctx, destroyStdout)
	assert.NoError(t, err)
}
