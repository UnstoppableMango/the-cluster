{
  description = "THECLUSTER";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";

    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;

      imports = [
        inputs.treefmt-nix.flakeModule
        ./containers
      ];

      perSystem =
        { pkgs, ... }:
        {
          devShells.default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              git
              nixfmt
              treefmt
              dprint
              docker
              fluxcd
              gnumake
              kubectl
              nixfmt-tree
              nodejs_24
              nurl
              pulumi-bin
              shellcheck
              watchexec
              yarn
              yq-go
            ];

            DPRINT = pkgs.dprint + "/bin/dprint";
            DOCKER = pkgs.docker + "/bin/docker";
            FLUX = pkgs.fluxcd + "/bin/flux";
            KUBECTL = pkgs.kubectl + "/bin/kubectl";
            PULUMI = pkgs.pulumi-bin + "/bin/pulumi";
            NODE = pkgs.nodejs_24 + "/bin/node";
            SHELLCHECK = pkgs.shellcheck + "/bin/shellsheck";
            YARN = pkgs.yarn + "/bin/yarn";
            YQ = pkgs.yq-go + "/bin/yq";
          };

          treefmt = {
            programs.nixfmt.enable = true;
          };
        };
    };
}
