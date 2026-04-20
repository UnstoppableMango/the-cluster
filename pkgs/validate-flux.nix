{ pkgs }:

let
  src = pkgs.fetchFromGitHub {
    owner = "fluxcd";
    repo = "flux2-kustomize-helm-example";
    rev = "242c5b1eb198aeefdc88f384c8aac7f661545e68";
    hash = "sha256-IKzUtjbicwc9KATy/ePbdMGLwFpCts2ct3Sj1X9lzDA=";
  };
in
pkgs.writeShellApplication {
  name = "validate-flux";
  runtimeInputs = with pkgs; [
    curl
    kubeconform
    kustomize
    yq-go
  ];
  text = builtins.readFile "${src}/scripts/validate.sh";
}
