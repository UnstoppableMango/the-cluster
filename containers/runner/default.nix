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
      # A wrong hash shows up only on the architecture it belongs to, so the
      # Containers workflow builds this on a native runner per system. Recover
      # the expected value from the `got:` line of that build's mismatch error.
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
          nix
        ];
        pathsToLink = [ "/bin" ];
        extraPrefix = "/usr/local";
      };

      # Settings every job wants, so no workflow has to pass them. Anything
      # cluster-specific, the ncps substituter above all, arrives as NIX_CONFIG
      # from the runner manifests, which nix merges on top of this file.
      nixConf = pkgs.writeTextDir "etc/nix/nix.conf" ''
        experimental-features = nix-command flakes pipe-operators
        # Nothing here runs as root and there is no daemon, so builds run as the
        # invoking user and the sandbox is unavailable.
        sandbox = false
      '';
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

        contents = [
          tools
          nixConf
        ];

        # Registers the store paths this image ships in /nix/var/nix/db, which is
        # what makes the baked nix usable instead of a pile of files nix does not
        # know about. Workflows can then skip cachix/install-nix-action.
        includeNixDB = true;

        # includeNixDB writes db.sqlite, big-lock and reserved with the modes
        # nix uses for a store it owns, which is 0600 root here. The runner pods
        # seed their /nix volume by copying this tree as the runner user, so
        # every file in it has to be readable.
        extraCommands = ''
          chmod -R a+rX nix/var/nix/db
        '';

        config = {
          Cmd = [ "/bin/bash" ];
          WorkingDir = "/home/runner";
          User = "runner";
          Env = [
            "USER=runner"
            # The base image is Ubuntu, so nix reaches substituters through its
            # CA bundle rather than a store path of its own.
            "NIX_SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt"
          ];
        };
      };
    };
}
