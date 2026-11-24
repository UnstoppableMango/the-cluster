# cert-manager

## Measurements

- All four cert-manager components idle at 1m CPU and 12-44Mi.
- The csi-driver's three containers reserve 120m CPU and 256Mi per node.
  On pik8s4-6 the whole budget is 4 GiB, and the kube-apiserver alone wants over 2 GiB.
