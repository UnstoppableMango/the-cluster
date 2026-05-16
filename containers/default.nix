{
  perSystem =
    {
      inputs',
      pkgs,
      lib,
      ...
    }:
    let
      inherit (inputs'.nix2container.packages) nix2container;
      inherit (inputs'.mynix.images) github-runner;

      callPackage = lib.callPackageWith (packages // pkgs);

      packages = {
        inherit github-runner nix2container;
        runner = callPackage ./runner { };
      };
    in
    {
      packages = {
        inherit (packages) runner;
      };
    };
}
