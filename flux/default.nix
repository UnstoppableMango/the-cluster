{
  perSystem =
    { pkgs, lib, ... }:
    let
      callPackage = lib.callPackageWith (pkgs // packages);

      packages = {
        validate-flux = callPackage ./validate.nix { };
        cert-manager-crds = callPackage ./cert-manager-crds.nix { };
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
