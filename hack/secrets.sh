#!/usr/bin/env bash
# Manage the sealed secret workflow.
#
# Plaintext stubs live under hack/secrets/ (gitignored) and mirror the path of
# the sealed manifest they produce:
#
#   hack/secrets/apps/dex/dex-credentials.yml  ->  apps/dex/dex-credentials-sealed.yml
#
# A secret is named by the sealed manifest's path without the -sealed.yml
# suffix, e.g. apps/dex/dex-credentials. The stub path and the sealed path are
# both accepted and normalized to that name.
set -euo pipefail

: "${KUBECTL:=kubectl}"
: "${KUBESEAL:=kubeseal}"
: "${YQ:=yq}"

: "${SEALED_SECRETS_CONTROLLER:=sealed-secrets-controller}"
: "${SEALED_SECRETS_NAMESPACE:=flux-system}"

root="$(git rev-parse --show-toplevel)"
cert="$root/hack/sealed-secrets.pub"
stub_root="$root/hack/secrets"

usage() {
	cat >&2 <<'EOF'
Usage: hack/secrets.sh <command> [args]

Commands:
  new <secret> -n <namespace> [-k <key>]...  Create an empty 0600 stub
  seal <secret> [--allow-empty]              Encrypt the stub into <secret>-sealed.yml
  unseal <secret> [--force]                  Write the live cluster secret back to the stub
  list                                       Show every secret and whether it needs sealing
  cert                                       Refresh hack/sealed-secrets.pub from the controller

A <secret> is a repo-relative path with no suffix, for example:
  apps/dex/dex-credentials
Its stub path (hack/secrets/apps/dex/dex-credentials.yml) and its sealed path
(apps/dex/dex-credentials-sealed.yml) are accepted too.
EOF
	exit 1
}

die() {
	echo "error: $*" >&2
	exit 1
}

# Strip the stub prefix, the file extension, and the -sealed suffix so every
# accepted spelling collapses to the same name.
normalize() {
	local name=$1
	name=${name#"$root/"}
	name=${name#./}
	name=${name#hack/secrets/}
	name=${name%.yaml}
	name=${name%.yml}
	name=${name%-sealed}
	[ -n "$name" ] || die "empty secret name"
	printf '%s' "$name"
}

stub_path() { printf '%s/%s.yml' "$stub_root" "$1"; }
sealed_path() { printf '%s/%s-sealed.yml' "$root" "$1"; }

# Every secret this repo knows about: anything with a stub, plus anything with
# a committed sealed manifest whose stub has not been unsealed locally.
all_secrets() {
	{
		if [ -d "$stub_root" ]; then
			find "$stub_root" -type f \( -name '*.yml' -o -name '*.yaml' \) \
				-printf '%P\n' | sed -e 's/\.ya\?ml$//'
		fi
		git -C "$root" ls-files '*-sealed.yml' | sed -e 's/-sealed\.yml$//'
	} | sort -u
}

require_cert() {
	[ -f "$cert" ] || cmd_cert
}

cmd_cert() {
	echo "fetching cert from $SEALED_SECRETS_CONTROLLER in $SEALED_SECRETS_NAMESPACE" >&2
	"$KUBESEAL" --fetch-cert \
		--controller-name "$SEALED_SECRETS_CONTROLLER" \
		--controller-namespace "$SEALED_SECRETS_NAMESPACE" \
		>"$cert"
	echo "wrote hack/sealed-secrets.pub" >&2
}

cmd_new() {
	local name='' namespace='' keys=()
	while [ $# -gt 0 ]; do
		case "$1" in
		-n | --namespace)
			namespace=$2
			shift 2
			;;
		-k | --key)
			keys+=("$2")
			shift 2
			;;
		-*) die "unknown flag $1" ;;
		*)
			[ -z "$name" ] || die "unexpected argument $1"
			name=$(normalize "$1")
			shift
			;;
		esac
	done

	[ -n "$name" ] || usage
	[ -n "$namespace" ] || die "--namespace is required"

	local stub
	stub=$(stub_path "$name")
	[ ! -f "$stub" ] || die "stub already exists: ${stub#"$root/"}"

	mkdir -p "$(dirname "$stub")"
	umask 0177
	{
		echo 'apiVersion: v1'
		echo 'kind: Secret'
		echo 'metadata:'
		echo "  name: $(basename "$name")"
		echo "  namespace: $namespace"
		echo 'type: Opaque'
		echo 'stringData:'
		if [ ${#keys[@]} -eq 0 ]; then
			echo '  # KEY: ""'
		else
			local key
			for key in "${keys[@]}"; do
				echo "  $key: \"\""
			done
		fi
	} >"$stub"
	chmod 0600 "$stub"

	echo "created ${stub#"$root/"}" >&2
	echo "populate it, then: make seal SECRET=$name" >&2
}

cmd_seal() {
	local name='' allow_empty=0
	while [ $# -gt 0 ]; do
		case "$1" in
		--allow-empty)
			allow_empty=1
			shift
			;;
		-*) die "unknown flag $1" ;;
		*)
			[ -z "$name" ] || die "unexpected argument $1"
			name=$(normalize "$1")
			shift
			;;
		esac
	done
	[ -n "$name" ] || usage

	local stub sealed
	stub=$(stub_path "$name")
	sealed=$(sealed_path "$name")

	[ -f "$stub" ] || die "no stub at ${stub#"$root/"}; run: hack/secrets.sh new $name -n <namespace>"

	local secret_name secret_namespace
	secret_name=$("$YQ" -r '.metadata.name // ""' "$stub")
	secret_namespace=$("$YQ" -r '.metadata.namespace // ""' "$stub")
	[ -n "$secret_name" ] || die "${stub#"$root/"} has no metadata.name"
	[ -n "$secret_namespace" ] || die "${stub#"$root/"} has no metadata.namespace"

	# Sealed secrets are encrypted against name+namespace. Sealing a renamed
	# stub over an existing manifest yields a secret the workload cannot find.
	if [ -f "$sealed" ]; then
		local prev_name prev_namespace
		prev_name=$("$YQ" -r '.spec.template.metadata.name // .metadata.name // ""' "$sealed")
		prev_namespace=$("$YQ" -r '.spec.template.metadata.namespace // .metadata.namespace // ""' "$sealed")
		if [ "$prev_name" != "$secret_name" ] || [ "$prev_namespace" != "$secret_namespace" ]; then
			echo "warning: renaming $prev_namespace/$prev_name to $secret_namespace/$secret_name" >&2
		fi
	fi

	local empty
	empty=$("$YQ" -r \
		'((.stringData // {}) + (.data // {})) | to_entries[] | select((.value // "") == "") | .key' \
		"$stub")
	if [ -n "$empty" ]; then
		echo "warning: empty values in ${stub#"$root/"}:" >&2
		local key
		while read -r key; do
			echo "  $key" >&2
		done <<<"$empty"
		[ "$allow_empty" -eq 1 ] || die "populate them, or re-run with --allow-empty"
	fi

	require_cert
	mkdir -p "$(dirname "$sealed")"
	"$KUBESEAL" --format=yaml --cert="$cert" \
		--secret-file "$stub" --sealed-secret-file "$sealed"

	echo "sealed $secret_namespace/$secret_name into ${sealed#"$root/"}" >&2
}

cmd_unseal() {
	local name='' force=0
	while [ $# -gt 0 ]; do
		case "$1" in
		--force)
			force=1
			shift
			;;
		-*) die "unknown flag $1" ;;
		*)
			[ -z "$name" ] || die "unexpected argument $1"
			name=$(normalize "$1")
			shift
			;;
		esac
	done
	[ -n "$name" ] || usage

	local stub sealed
	stub=$(stub_path "$name")
	sealed=$(sealed_path "$name")

	[ -f "$sealed" ] || die "no sealed manifest at ${sealed#"$root/"}"
	if [ -f "$stub" ] && [ "$force" -eq 0 ]; then
		die "${stub#"$root/"} already exists; re-run with --force to overwrite it"
	fi

	local secret_name secret_namespace
	secret_name=$("$YQ" -r '.spec.template.metadata.name // .metadata.name // ""' "$sealed")
	secret_namespace=$("$YQ" -r '.spec.template.metadata.namespace // .metadata.namespace // ""' "$sealed")
	[ -n "$secret_name" ] || die "${sealed#"$root/"} has no secret name"
	[ -n "$secret_namespace" ] || die "${sealed#"$root/"} has no secret namespace"

	mkdir -p "$(dirname "$stub")"
	umask 0177
	# Keep only the fields a stub needs, and decode data back into stringData so
	# the result is editable and re-sealable as-is.
	"$KUBECTL" get secret "$secret_name" --namespace "$secret_namespace" --output yaml |
		"$YQ" '{
			"apiVersion": "v1",
			"kind": "Secret",
			"metadata": {"name": .metadata.name, "namespace": .metadata.namespace},
			"type": .type,
			"stringData": ((.data // {}) | map_values(@base64d))
		}' >"$stub"
	chmod 0600 "$stub"

	echo "wrote $secret_namespace/$secret_name to ${stub#"$root/"}" >&2
}

cmd_list() {
	local name stub sealed status
	while read -r name; do
		[ -n "$name" ] || continue
		stub=$(stub_path "$name")
		sealed=$(sealed_path "$name")
		if [ ! -f "$stub" ]; then
			status='no stub (unseal to edit)'
		elif [ ! -f "$sealed" ]; then
			status='never sealed'
		elif [ "$stub" -nt "$sealed" ]; then
			status='stub newer (needs seal)'
		else
			status='sealed'
		fi
		printf '%-58s %s\n' "$name" "$status"
	done < <(all_secrets)
}

[ $# -gt 0 ] || usage
command=$1
shift

case "$command" in
new) cmd_new "$@" ;;
seal) cmd_seal "$@" ;;
unseal) cmd_unseal "$@" ;;
list) cmd_list "$@" ;;
cert) cmd_cert "$@" ;;
-h | --help | help) usage ;;
*) die "unknown command $command" ;;
esac
