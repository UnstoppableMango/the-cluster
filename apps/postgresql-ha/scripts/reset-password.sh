#!/bin/bash
set -eum

root="$(git rev-parse --show-toplevel)"
projDir="$root/apps/postgresql"
# shellcheck source=/dev/null
source "$root/scripts/util/yes-no.sh"
name="$1"
stack="$(pulumi -C "$projDir" stack --show-name)"
keeper="$(date)"

# There's gotta be a better way to do this
# shellcheck disable=SC2034
discard="$(yesNo "Is stack '$stack' correct?")"
echo "Setting keeper for '$name' on stack '$stack' to '$keeper'..."
pulumi -C "$projDir" config set --path "keepers.$name" "$keeper"
