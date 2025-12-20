{
  perSystem =
    { pkgs, ... }:
    {
      packages.runner = pkgs.dockerTools.buildImage {
        fromImage = pkgs.dockerTools.pullImage {
          imageName = "actions/actions-runner";
          imageDigest = "sha256:ee54ad8776606f29434f159196529b7b9c83c0cb9195c1ff5a7817e7e570dcfe";
          sha256 = "sha256-0v1z2y3x4w5v6u7t8s9r0q1p2o3n4m5l6k7j8i9h0g1f2e3d4c5b6a7"; # Example SHA256
        };

        name = "thecluster-runner";
        tag = "latest";

        copyToRoot = with pkgs; [
          gnumake
        ];

        config = { };
      };
    };
}
