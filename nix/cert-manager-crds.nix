{ pkgs }:
pkgs.fetchurl {
  name = "cert-manager-crds.yaml";
  url = "https://github.com/cert-manager/cert-manager/releases/download/v1.21.2/cert-manager.crds.yaml";
  hash = "sha256-Ji/veEeEks01tzobInEGt4AvnAVjYdH1YdBLMtdRM38=";
}
