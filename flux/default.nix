{
  perSystem =
    {
      self',
      pkgs,
      lib,
      ...
    }:
    let
      callPackage = lib.callPackageWith (pkgs // packages);
      inherit (self'.legacyPackages) kubelib;

      packages = {
        validate-flux = callPackage ./validate.nix { };
        cert-manager-crds = callPackage ./cert-manager-crds.nix { };
        thecluster-crds = callPackage ./crds.nix { inherit kubelib; };
      };
    in
    {
      inherit packages;

      checks.validate-flux = pkgs.runCommand "validate-flux-check" { } ''
        ${packages.validate-flux}/bin/validate-flux --dir ${./.}
        touch $out
      '';
    };
}
