#!/bin/bash
set -em

if ! command -v clusterctl >/dev/null 2>&1; then
    >&2 echo "Install clusterctl first https://cluster-api.sigs.k8s.io/user/quick-start#install-clusterctl"
    exit 1
fi

if ! command -v kubectl-slice >/dev/null 2>&1; then
    >&2 echo "Install kubectl-slice first https://github.com/patrickdappollonio/kubectl-slice#installation"
    exit 1
fi

if [ -z "${GITHUB_TOKEN+x}" ]; then
    >&2 echo "It is recommended to set GITHUB_TOKEN to avoid rate limiting"
    >&2 echo "https://cluster-api.sigs.k8s.io/clusterctl/overview.html#avoiding-github-rate-limiting"
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--component)
      component="$2"; shift; shift
      case "$component" in
        core|bootstrap|control-plane|infrastructure);;
        *) >&2 echo "Unsupported component type $component";;
      esac
      ;;
    -m|--module)
      module="$2"; shift; shift
      ;;
    -v|--version)
      version="$2"; shift; shift
      ;;
    --config)
      config="$2"; shift; shift
      ;;
    -*)
      echo "Unknown option $1"; exit 1
      ;;
    *)
      shift
      ;;
  esac
done

root="$(git rev-parse --show-toplevel)"

export EXP_CLUSTER_RESOURCE_SET=true
export CLUSTER_TOPOLOGY=true

if [ -z "${component+x}" ]; then
    >&2 echo "Component is required in position 1 (e.g. infrastructure)"
    exit 1
fi

if [ -z "${module+x}" ]; then
    >&2 echo "Module is required in position 2 (e.g. talos)"
    exit 1
fi

if [ -z "${version+x}" ]; then
    >&2 echo "Version is required in position 3 (e.g. v1.2.3)"
    exit 1
fi

if [ -z "${config+x}" ]; then
  "$root/gen/clusterctl/config.sh"
  config="$root/gen/clusterctl/config.yaml"
fi

>&2 echo "Generating CRDs for $module $version"
clusterctl generate provider --"$component" "$module:$version" \
  --config "$config"
