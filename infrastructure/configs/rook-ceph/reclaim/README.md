# reclaim

PersistentVolumes for ceph RBD images that no workload owns, paired with claims in the
`ceph-reclaim` namespace.

Each volume carries `persistentVolumeReclaimPolicy: Delete`, so deleting this directory prunes the
claims and ceph-csi removes the underlying image along with its CSI journal entry in the pool.
Volumes are labelled `thecluster.io/origin-namespace` with the namespace that owned them on the
previous cluster.

Deleting the manifests destroys the data.
