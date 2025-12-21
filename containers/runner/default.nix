{
  perSystem =
    { pkgs, ... }:
    {
      packages.runner = pkgs.dockerTools.buildLayeredImage {
        # https://github.com/actions/runner/tree/main/images/Dockerfile
        fromImage = pkgs.dockerTools.pullImage {
          imageName = "ghcr.io/actions/actions-runner";
          imageDigest = "sha256:ee54ad8776606f29434f159196529b7b9c83c0cb9195c1ff5a7817e7e570dcfe";
          hash = "sha256-XQFr8ppWDztVi7f6e+6KhzppqWQg+5uVvmDQNMd41CI=";
          finalImageName = "ghcr.io/actions/actions-runner";
          finalImageTag = "2.330.0";
        };

        name = "thecluster-runner";
        tag = "latest";

        contents = with pkgs; [
          gnumake
          xz
        ];

        enableFakechroot = true;
        # Things inside the base image seem to expect /bin/bash and /bin/sh to exist
        fakeRootCommands = ''
          ln -s /usr/bin/bash /bin/bash
          ln -s /usr/bin/sh /bin/sh
        '';

        config = {
          Cmd = [ "/bin/bash" ];
          WorkingDir = "/home/runner";
          User = "runner";
        };
      };
    };
}
