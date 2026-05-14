{
  callPackage,
  fetchurl,
  kubectl-slice,
  kubelib,
  symlinkJoin,
  runCommand,
}:
let
  fluxSrc = callPackage ./src.nix { };
  fromFlux = path: kubelib.fromYAML (builtins.readFile "${fluxSrc}/${path}") |> builtins.head;
  fromControllers = path: fromFlux "infrastructure/controllers/${path}";

  downloadFluxHelmChart =
    { chartHash, namespace }:
    let
      rel = fromControllers "${namespace}/helm-release.yml";
      repo = fromControllers "${namespace}/helm-repository.yml";
    in
    kubelib.downloadHelmChart {
      inherit chartHash;
      repo = repo.spec.url;
      chart = rel.spec.chart.spec.chart;
      version = rel.spec.chart.spec.version;
    };

  agones = kubelib.buildHelmChart {
    name = "agones";
    chart = downloadFluxHelmChart {
      namespace = "agones-system";
      chartHash = "sha256-8eaRT40afNFNi/YMIq14A8xODDiI2L+ZUbqpbSA8/kM=";
    };
    includeCRDs = true;
  };

  cert-manager = fetchurl {
    url = "https://github.com/cert-manager/cert-manager/releases/download/v1.20.2/cert-manager.crds.yaml";
    hash = "sha256-bam+tTJGlQN94x/qmYCZwURvbOToCfMrE6dolPTxafA=";
  };

  cert-manager-helm = kubelib.buildHelmChart {
    name = "cert-manager";
    chart = downloadFluxHelmChart {
      namespace = "cert-manager";
      chartHash = "sha256-4V44v91c1wUBKDr7GbhahRWCjPtl1zCT9Bd0Hn5gCYY=";
    };
    includeCRDs = true;
    values = {
      installCRDs = true;
    };
  };

  cloudnative-pg = kubelib.buildHelmChart {
    name = "cloudnative-pg";
    chart = downloadFluxHelmChart {
      namespace = "cnpg-system";
      chartHash = "sha256-IE5HEzMotxW00cdnmgJgDedNS42iBiuiwYRo9pe/10w=";
    };
    includeCRDs = true;
  };

  sliceCRDs =
    name: src:
    runCommand "${name}-crds" { } ''
      mkdir -p $out/crds
      ${kubectl-slice}/bin/kubectl-slice \
        --input-file ${src} \
        --include-kind CustomResourceDefinition \
        --skip-non-k8s \
        --stdout >$out/crds/${name}.yml
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
