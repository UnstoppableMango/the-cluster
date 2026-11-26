{ lib }:
let
  fs = lib.fileset;
in
fs.toSource {
  root = ../.;

  fileset = fs.intersection (fs.gitTracked ../.) ../infrastructure;
}
