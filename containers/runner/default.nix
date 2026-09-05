{
  perSystem =
    { pkgs, system, ... }:
    let
      # Per-architecture manifests behind the multi-arch index
      # ghcr.io/actions/actions-runner:2.337.0, which is
      # sha256:e5496277be5d09bc968b3d64911b74e219ac4a3f2edce956a3ecf9271bea1ef4.
      # pullImage fetches a single-architecture tarball, so both the manifest
      # digest and the hash of what it produces are per system.
      # Resolve digests with:
      #   docker buildx imagetools inspect ghcr.io/actions/actions-runner:2.337.0 --raw
      baseImages = {
        x86_64-linux = {
          imageDigest = "sha256:5036480998280bb21e32ade9fe1b02b493861ac314b62ba1aea320b94f56ec97";
          hash = "sha256-8kvFXvzLgLUssnF/ktQ3cx2/0omYybEZP9sSc6n5cJY=";
        };
        aarch64-linux = {
          imageDigest = "sha256:f5a0d9a3d857315f2aed7075a02a29f46927ad198221c3b1c66585ae9fe36c0d";
          hash = "sha256-KeaZrUxfLcSg0iJIaYL8BCLNjSSn+By4XUSSmvPtkvo=";
        };
      };

      baseImage =
        baseImages.${system}
          or (throw "thecluster-runner: no actions-runner base image recorded for ${system}");

      # Linking into /usr/local/bin keeps the base image's /bin -> usr/bin
      # symlink intact. A layer containing a real ./bin directory replaces that
      # symlink and hides everything the base image resolves through it.
      tools = pkgs.buildEnv {
        name = "thecluster-runner-tools";
        paths = with pkgs; [
          gnumake
          xz
        ];
        pathsToLink = [ "/bin" ];
        extraPrefix = "/usr/local";
      };
    in
    {
      packages.runner = pkgs.dockerTools.buildLayeredImage {
        # https://github.com/actions/runner/tree/main/images/Dockerfile
        fromImage = pkgs.dockerTools.pullImage {
          imageName = "ghcr.io/actions/actions-runner";
          inherit (baseImage) imageDigest hash;
          finalImageName = "ghcr.io/actions/actions-runner";
          finalImageTag = "2.337.0";
        };

        name = "thecluster-runner";
        tag = "latest";

        contents = [ tools ];

        config = {
          Cmd = [ "/bin/bash" ];
          WorkingDir = "/home/runner";
          User = "runner";
          Env = [ "USER=runner" ];
        };
      };
    };
}
