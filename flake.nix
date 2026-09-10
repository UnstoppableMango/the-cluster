{
  description = "THECLUSTER";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:UnstoppableMango/nix-systems";
    nix-kube-generators.url = "github:farcaller/nix-kube-generators";

    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";

    mynix = {
      url = "github:UnstoppableMango/nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-parts.follows = "flake-parts";
        treefmt-nix.follows = "treefmt-nix";
        systems.follows = "systems";
      };
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;

      imports = with inputs; [
        systems.flakeModule

        treefmt-nix.flakeModule
        ./nix
      ];

      perSystem =
        { pkgs, system, ... }:
        {
          _module.args.pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = with inputs; [
              mynix.overlays.default
            ];
          };

          legacyPackages.kubelib = inputs.nix-kube-generators.lib {
            inherit pkgs;
          };

          devShells.default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              bash # For copilot
              crossplane-cli
              git
              nixfmt
              treefmt
              dprint
              docker
              fluxcd
              gnumake
              kubernetes-helm
              kubectl
              kubeseal
              nixfmt-tree
              nurl
              pulumi-bin
              shellcheck
              velero
              watchexec
              yq-go
            ];
          };

          treefmt = {
            programs.nixfmt.enable = true;
          };
        };
    };
}
