{ lib }:
let
  fs = lib.fileset;
in
fs.toSource {
  root = ./.;

  # Everything except nix files
  fileset = fs.intersection (fs.gitTracked ./.) ./infrastructure;
}
