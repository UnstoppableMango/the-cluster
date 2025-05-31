#!/bin/bash

root="$(git rev-parse --show-toplevel)"
ignoreNames=(
  'node_modules'
  'bin'
  'obj'
  '.git'
  '.vscode'
  'gen'
  'spec'
  'src'
  'manifests'
  'archive'
  '.github'
  '.config'
  'rosequartz/*'
)

tree -L 3 -and --gitignore --matchdirs \
  -I "$(IFS=\| ; echo "${ignoreNames[*]}")" \
  "$root"
