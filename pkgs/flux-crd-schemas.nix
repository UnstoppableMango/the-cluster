{ pkgs }:

let
  fluxOperatorSchemas = pkgs.fetchurl {
    url = "https://github.com/controlplaneio-fluxcd/flux-operator/releases/download/v0.47.0/crd-schemas.tar.gz";
    hash = "sha256-eCk/JE4Kz8AK8K8U45iP1Ex0HlpV1lBFF7tuZ5Tms94=";
  };
  flux2Schemas = pkgs.fetchurl {
    url = "https://github.com/fluxcd/flux2/releases/download/v2.8.5/crd-schemas.tar.gz";
    hash = "sha256-mRey8M8vanOCaGprO3oZZbYPfPDTXgTFFCgbgtoMp5g=";
  };
in
pkgs.runCommand "flux-crd-schemas" { } ''
  mkdir -p $out/master-standalone-strict
  tar xf ${fluxOperatorSchemas} -C $out/master-standalone-strict
  tar xf ${flux2Schemas} -C $out/master-standalone-strict
''
