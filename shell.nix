{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShellNoCC {
  packages = with pkgs; [
    dprint
    docker
    fluxcd
    gnumake
    kubectl
    nixfmt-tree
    nodejs_24
    pulumi-bin
    shellcheck
    watchexec
    yarn
    yq-go
  ];

  # I'm probably an idiot for doing it this way, time will tell...
  DPRINT = pkgs.dprint + "/bin/dprint";
  DOCKER = pkgs.docker + "/bin/docker";
  FLUX = pkgs.fluxcd + "/bin/flux";
  KUBECTL = pkgs.kubectl + "/bin/kubectl";
  PULUMI = pkgs.pulumi-bin + "/bin/pulumi";
  NODE = pkgs.nodejs_24 + "/bin/node";
  SHELLCHECK = pkgs.shellcheck + "/bin/shellsheck";
  YARN = pkgs.yarn + "/bin/yarn";
  YQ = pkgs.yq-go + "/bin/yq";
}
