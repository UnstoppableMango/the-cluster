# Dev Container

By default, the devcontainer will use `Dockerfile.archlinux`.
Unfortunately, there is not an ARM build of the arch linux docker container.
To develop in the devcontainer on an ARM machine, modify `docker-compose.override.yaml`.

Modifying the override file to be:

```yaml
version: '3'
services:
  devcontainer:
    build:
      dockerfile: Dockerfile.ubuntu
```

will run the devcontainer using an Ubuntu base, which does have an ARM build.

Additional options can be set in `docker-compose.override.yaml` which will override anything in the base `docker-compose.yaml`;
Reference for [merging multiple compose files](https://docs.docker.com/compose/multiple-compose-files/merge/).

In order to facilitate local overrides with minimal configuration changes `docker-compose.override.yaml` is added to git, but changes are ignored with

```shell
git update-index --skip-worktree docker-compose.override.yaml
```

This way `devcontainer.json` does not need to be modified and can include the `docker-compose.override.yaml` without actually overriding anything.
Additonally `docker-compose.override.yaml` can be modified locally without having to ignore those modifications when committing real changes.
[StackOverflow question](https://stackoverflow.com/questions/13630849/git-difference-between-assume-unchanged-and-skip-worktree/13631525#13631525) explaining `--skip-worktree`.

A few helper scripts are provided for switching between the two images.

- `use-arch.sh`
- `use-ubuntu.sh`

To commit changes to `docker-compose.override.yaml` run

```shell
git update-index --no-skip-worktree docker-compose.override.yaml
```
