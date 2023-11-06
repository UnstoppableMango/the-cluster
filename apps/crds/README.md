# THECLUSTER CRDs

## Notes

Many CAPI CRDs have finalizers on them which makes this separate `crds` stack awkward...
When tearing down we'll remove the controllers, and then the CRDs; backwards from normal.
The CRDs will likely time out because there are no controllers to remove the finalizers.
