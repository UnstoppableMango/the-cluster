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
        let
          validate-flux = pkgs.callPackage ./nix/validate-flux.nix { };
          cert-manager-crds = pkgs.callPackage ./nix/cert-manager-crds.nix { };
        in
        {
          packages.validate-flux = validate-flux;
          packages.cert-manager-crds = cert-manager-crds;

          checks.validate-flux = pkgs.runCommand "validate-flux-check" { } ''
            ${validate-flux}/bin/validate-flux --dir ${./flux}
            touch $out
          '';

          devShells.default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              validate-flux
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
              velero
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
            settings.global.excludes = [
              "**/node_modules/**"
              "**/.yarn/**"
              "crds/**"
              "yarn.lock"
            ];

            programs.nixfmt.enable = true;

            programs.dprint = {
              enable = true;
              settings = {
                useTabs = true;
                typescript = {
                  semiColons = "always";
                  quoteStyle = "preferSingle";
                };
                markdown.textWrap = "never";
                plugins = pkgs.dprint-plugins.getPluginList (
                  p: with p; [
                    dprint-plugin-typescript
                    dprint-plugin-json
                    dprint-plugin-markdown
                    dprint-plugin-toml
                  ]
                );
              };
            };
          };
        };
    };
}
