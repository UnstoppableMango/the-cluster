root="$(git rev-parse --show-toplevel)/clusters/pinkdiamond"
stack="$(pulumi -C "$root" stack --show-name)"
export KUBECONFIG="$root/.config/$stack/kubeconfig"
export TALOSCONFIG="$root/.config/$stack/talosconfig.yaml"
