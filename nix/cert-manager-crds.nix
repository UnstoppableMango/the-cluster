{ pkgs }:
pkgs.fetchurl {
  name = "cert-manager-crds.yaml";
  url = "https://github.com/cert-manager/cert-manager/releases/download/v1.18.2/cert-manager.crds.yaml";
  hash = "sha256-dA6eFEIPkRNIgjsBYbr3+1IwqPceiw7PDIJpT3th+w8=";
}
