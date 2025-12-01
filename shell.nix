{
  pkgs ? import <nixpkgs> { },
}:

pkgs.mkShellNoCC {
  packages = with pkgs; [
    dprint
    docker
    fluxcd
    git
    gnumake
    go
    kind
    kubectl
    kubernetes-helm
    nil
    nixfmt
    nodejs_24
    pulumi-bin
    shellcheck
    watchexec
    yarn
    yq-go
  ];

  DPRINT = pkgs.dprint + "/bin/dprint";
  DOCKER = pkgs.docker + "/bin/docker";
  FLUX = pkgs.fluxcd + "/bin/flux";
  HELM = pkgs.kubernetes-helm + "/bin/helm";
  KIND = pkgs.kind + "/bin/kind";
  KUBECTL = pkgs.kubectl + "/bin/kubectl";
  NODE = pkgs.nodejs_24 + "/bin/node";
  PULUMI = pkgs.pulumi-bin + "/bin/pulumi";
  SHELLCHECK = pkgs.shellcheck + "/bin/shellsheck";
  YARN = pkgs.yarn + "/bin/yarn";
  YQ = pkgs.yq-go + "/bin/yq";
}
