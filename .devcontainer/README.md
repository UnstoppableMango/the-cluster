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
