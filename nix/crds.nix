{
  callPackage,
  fetchurl,
  kubelib,
  lib,
  symlinkJoin,
  runCommand,
  yq-go,
}:
let
  fluxSrc = callPackage ./src.nix { };

  # kubelib.fromYAML parses in a derivation, which is import-from-derivation.
  # These manifests hold each key once, so the first `key: value` line is it.
  readField =
    path: key:
    let
      lines = lib.splitString "\n" (builtins.readFile "${fluxSrc}/infrastructure/controllers/${path}");
      matches = map (builtins.match "[[:space:]]*${key}: ([^[:space:]#]+).*") lines;
    in
    lib.findFirst (m: m != null) (throw "no ${key} in ${path}") matches |> builtins.head;

  downloadFluxHelmChart =
    { chartHash, releaseNamespace }:
    let
      field = file: readField "${releaseNamespace}/${file}.yml";
    in
    kubelib.downloadHelmChart {
      inherit chartHash;
      repo = field "helm-repository" "url";
      chart = field "helm-release" "chart";
      version = field "helm-release" "version";
    };

  agones = kubelib.buildHelmChart {
    name = "agones";
    chart = downloadFluxHelmChart {
      releaseNamespace = "agones-system";
      chartHash = "sha256-T7tU2xghmz7MytJxYtxbZPl1yCwrIvuwekjlgQi/dAk=";
    };
    includeCRDs = true;
  };

  cert-manager = fetchurl {
    url = "https://github.com/cert-manager/cert-manager/releases/download/v1.21.2/cert-manager.crds.yaml";
    hash = "sha256-Ji/veEeEks01tzobInEGt4AvnAVjYdH1YdBLMtdRM38=";
  };

  cert-manager-helm = kubelib.buildHelmChart {
    name = "cert-manager";
    chart = downloadFluxHelmChart {
      releaseNamespace = "cert-manager-system";
      chartHash = "sha256-AsbUc4Q9aVfTmENGPPmjOwC6V6v3MpTN1cKIl8csi10=";
    };
    includeCRDs = true;
    values = {
      installCRDs = true;
    };
  };

  cloudnative-pg = kubelib.buildHelmChart {
    name = "cloudnative-pg";
    chart = downloadFluxHelmChart {
      releaseNamespace = "cnpg-system";
      chartHash = "sha256-VWDikb5gw9s35yZYk3BqcojQtEE/b3gdDN6TCcJXzZ4=";
    };
    includeCRDs = true;
  };

  sliceCRDs =
    name: src:
    runCommand "${name}-crds" { } ''
      mkdir -p $out/crds
      ${lib.getExe yq-go} 'select(.kind == "CustomResourceDefinition")' ${src} >$out/crds/${name}.yml
    '';

  copyFile =
    name: src:
    runCommand "${name}-crds" { } ''
      mkdir -p $out/crds
      cp ${src} $out/crds/${name}.yml
    '';
in
symlinkJoin {
  name = "thecluster-crds";
  paths = [
    (sliceCRDs "agones" agones)
    (copyFile "cert-manager" cert-manager)
    (sliceCRDs "cert-manager-helm" cert-manager-helm)
    (sliceCRDs "cloudnative-pg" cloudnative-pg)
  ];
}
