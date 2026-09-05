{
  perSystem =
    { pkgs, ... }:
    {
      packages.runner = pkgs.dockerTools.buildLayeredImage {
        # https://github.com/actions/runner/tree/main/images/Dockerfile
        fromImage = pkgs.dockerTools.pullImage {
          imageName = "ghcr.io/actions/actions-runner";
          imageDigest = "sha256:e5496277be5d09bc968b3d64911b74e219ac4a3f2edce956a3ecf9271bea1ef4";
          hash = "sha256-8kvFXvzLgLUssnF/ktQ3cx2/0omYybEZP9sSc6n5cJY=";
          finalImageName = "ghcr.io/actions/actions-runner";
          finalImageTag = "2.337.0";
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
          Env = [ "USER=runner" ];
        };
      };
    };
}
