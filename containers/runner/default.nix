{
  bash,
  docker,
  gh,
  gnumake,
  github-runner,
  nix2container,
  podman,
  xz,
  ...
}:
nix2container.buildImage {
  name = "thecluster-runner";
  tag = "latest";

  copyToRoot = [
    bash
    docker
    gh
    gnumake
    podman
    xz
  ];

  layers = [
    # https://github.com/UnstoppableMango/nix/blob/main/packages/images/github-runner.nix
    (nix2container.buildLayer { deps = [ github-runner ]; })
  ];

  # Good for running nix commands inside the container
  initializeNixDatabase = true;

  # enableFakechroot = true;
  # # Things inside the base image seem to expect /bin/bash and /bin/sh to exist
  # fakeRootCommands = ''
  #   ln -s /usr/bin/bash /bin/bash
  #   ln -s /usr/bin/sh /bin/sh
  # '';

  config = {
    # Cmd = [ "/bin/bash" ];
    WorkingDir = "/home/runner";
    User = "runner";
    Env = [ "USER=runner" ];
  };
}
