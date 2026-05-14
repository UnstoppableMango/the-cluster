{ lib }:
let
  fs = lib.fileset;
in
fs.toSource {
  root = ./.;

  # Everything except nix files
  fileset = fs.unions [
    (fs.gitTracked ./.)
    ./infrastructure
  ];
}
