# coding=utf-8
# *** WARNING: this file was generated by crd2pulumi. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

from .. import _utilities
import typing

# Make subpackages available:
if typing.TYPE_CHECKING:
    import pulumi_crds.infrastructure.v1alpha1 as __v1alpha1
    v1alpha1 = __v1alpha1
    import pulumi_crds.infrastructure.v1alpha2 as __v1alpha2
    v1alpha2 = __v1alpha2
    import pulumi_crds.infrastructure.v1alpha3 as __v1alpha3
    v1alpha3 = __v1alpha3
    import pulumi_crds.infrastructure.v1beta1 as __v1beta1
    v1beta1 = __v1beta1
else:
    v1alpha1 = _utilities.lazy_import('pulumi_crds.infrastructure.v1alpha1')
    v1alpha2 = _utilities.lazy_import('pulumi_crds.infrastructure.v1alpha2')
    v1alpha3 = _utilities.lazy_import('pulumi_crds.infrastructure.v1alpha3')
    v1beta1 = _utilities.lazy_import('pulumi_crds.infrastructure.v1beta1')
