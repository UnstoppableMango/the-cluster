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

      imports = with inputs; [
        treefmt-nix.flakeModule
        ./containers
      ];

      perSystem =
        { pkgs, ... }:
        {
          devShells.default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              bash # For copilot
              crossplane-cli
              git
              go
              nixfmt
              treefmt
              dprint
              docker
              fluxcd
              fnm
              gnumake
              kubectl
              nixfmt-tree
              nurl
              pulumi-bin
              shellcheck
              watchexec
              yarn
              yq-go
            ];

            shellHook = ''
              eval "$(fnm env --corepack-enabled --shell bash)"
            '';

            DOCKER = "${pkgs.docker}/bin/docker";
            DPRINT = "${pkgs.dprint}/bin/dprint";
            FLUX = "${pkgs.fluxcd}/bin/flux";
            GO = "${pkgs.go}/bin/go";
            KUBECTL = "${pkgs.kubectl}/bin/kubectl";
            PULUMI = "${pkgs.pulumi-bin}/bin/pulumi";
            SHELLCHECK = "${pkgs.shellcheck}/bin/shellcheck";
            YARN = "${pkgs.yarn}/bin/yarn";
            YQ = "${pkgs.yq-go}/bin/yq";
          };

          treefmt = {
            programs.nixfmt.enable = true;
          };
        };
    };
}
