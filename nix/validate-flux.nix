{ pkgs }:
let
  fluxOperatorSchemas = pkgs.fetchurl {
    url = "https://github.com/controlplaneio-fluxcd/flux-operator/releases/download/v0.48.0/crd-schemas.tar.gz";
    hash = "sha256-MGaE7Ja+G9n3WVRpNOfu7n+Vk4mxKg9mNo8euKJQwBc=";
  };
  flux2Schemas = pkgs.fetchurl {
    url = "https://github.com/fluxcd/flux2/releases/download/v2.8.5/crd-schemas.tar.gz";
    hash = "sha256-mRey8M8vanOCaGprO3oZZbYPfPDTXgTFFCgbgtoMp5g=";
  };
  # https://github.com/fluxcd/flux2-kustomize-helm-example/blob/main/scripts/validate.sh#L95C1-L100
  crdSchemas = pkgs.runCommand "flux-crd-schemas" { } ''
    mkdir -p $out/master-standalone-strict
    tar xf ${fluxOperatorSchemas} -C $out/master-standalone-strict
    tar xf ${flux2Schemas} -C $out/master-standalone-strict
  '';

  src = pkgs.fetchFromGitHub {
    owner = "fluxcd";
    repo = "flux2-kustomize-helm-example";
    rev = "242c5b1eb198aeefdc88f384c8aac7f661545e68";
    hash = "sha256-IKzUtjbicwc9KATy/ePbdMGLwFpCts2ct3Sj1X9lzDA=";
  };

  patchedScript = pkgs.runCommand "validate-flux-script" { } ''
    sed \
      -e '/^download_schemas$/d' \
      -e 's| "-schema-location" "default"||' \
      -e 's|/tmp/flux-crd-schemas|${crdSchemas}|g' \
      ${src}/scripts/validate.sh > $out
  '';
in
pkgs.writeShellApplication {
  name = "validate-flux";
  runtimeInputs = with pkgs; [
    curl
    kubeconform
    kustomize
    yq-go
  ];
  text = builtins.readFile "${patchedScript}";
}
