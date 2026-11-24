# rook-ceph operator

## Measurements

The CSI controller plugins request roughly 1Gi each.
On a 3.6Gi node that already holds a mon, that leaves no room for the per-node daemonsets.
