root="$(git rev-parse --show-toplevel)/clusters/rosequartz"
stack="$(pulumi -C "$root" stack --show-name)"
export KUBECONFIG="$root/.kube/$stack/config"
export TALOSCONFIG="$root/.talos/$stack/talosconfig.yaml"
