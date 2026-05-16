{
  gh,
  gnumake,
  github-runner,
  nix2container,
  xz,
  ...
}:
nix2container.buildImage {
  name = "thecluster-runner";
  tag = "latest";

  # https://github.com/UnstoppableMango/nix/blob/main/packages/images/github-runner.nix
  fromImage = github-runner;
  maxLayers = 2;

  copyToRoot = [
    gh
    gnumake
    xz
  ];

  # enableFakechroot = true;
  # # Things inside the base image seem to expect /bin/bash and /bin/sh to exist
  # fakeRootCommands = ''
  #   ln -s /usr/bin/bash /bin/bash
  #   ln -s /usr/bin/sh /bin/sh
  # '';

  config = {
    Cmd = [ "/bin/bash" ];
    WorkingDir = "/home/runner";
    User = "runner";
    Env = [ "USER=runner" ];
  };
}
