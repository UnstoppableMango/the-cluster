#!/bin/bash
set -eu

PULUMI=pulumi

if [ ! "${STACK_PATH:-}" ]; then
    echo 'STACK_PATH required'
    exit 1
fi

root="$(git rev-parse --show-toplevel)"
cur="$root/infra/hosts"

echo "Using "
echo "  pulumi: $PULUMI"
echo "  git:    $root"
echo "  cur:    $cur"
echo "  stack:  $STACK_PATH"

$PULUMI -C "$STACK_PATH" stack output --show-secrets --json \
    | jq '.hostKeys | to_entries | map(.key, .value.publicKeyOpenssh)' \
    > "$cur/.config/keys.json"
