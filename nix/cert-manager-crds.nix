{ pkgs }:
pkgs.fetchurl {
  name = "cert-manager-crds.yaml";
  url = "https://github.com/cert-manager/cert-manager/releases/download/v1.21.3/cert-manager.crds.yaml";
  hash = "sha256-KYELKoTI7gcxp5Z57h39fpPNdQ6wJEVC7sR/qHAPJ0k=";
}
