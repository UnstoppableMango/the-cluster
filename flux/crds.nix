{
  fetchurl,
  kubelib,
  symlinkJoin,
  runCommand,
}:
let
  cert-manager = fetchurl {
    url = "https://github.com/cert-manager/cert-manager/releases/download/v1.20.2/cert-manager.crds.yaml";
    hash = "sha256-bam+tTJGlQN94x/qmYCZwURvbOToCfMrE6dolPTxafA=";
  };

  agones = kubelib.buildHelmChart {
    name = "agones";
    chart = kubelib.downloadHelmChart {
      repo = "https://agones.dev/chart/stable";
      chart = "agones";
      version = "1.57.0";
      chartHash = "sha256-8eaRT40afNFNi/YMIq14A8xODDiI2L+ZUbqpbSA8/kM=";
    };
    includeCRDs = true;
  };

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
    (copyFile "agones" agones)
    (copyFile "cert-manager" cert-manager)
  ];
}
