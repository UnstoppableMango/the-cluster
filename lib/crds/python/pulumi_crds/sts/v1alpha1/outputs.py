# coding=utf-8
# *** WARNING: this file was generated by crd2pulumi. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

import copy
import warnings
import pulumi
import pulumi.runtime
from typing import Any, Mapping, Optional, Sequence, Union, overload
from ... import _utilities
from . import outputs

__all__ = [
    'PolicyBindingSpec',
    'PolicyBindingSpecApplication',
    'PolicyBindingStatus',
    'PolicyBindingStatusUsage',
]

@pulumi.output_type
class PolicyBindingSpec(dict):
    def __init__(__self__, *,
                 application: 'outputs.PolicyBindingSpecApplication',
                 policies: Sequence[str]):
        pulumi.set(__self__, "application", application)
        pulumi.set(__self__, "policies", policies)

    @property
    @pulumi.getter
    def application(self) -> 'outputs.PolicyBindingSpecApplication':
        return pulumi.get(self, "application")

    @property
    @pulumi.getter
    def policies(self) -> Sequence[str]:
        return pulumi.get(self, "policies")


@pulumi.output_type
class PolicyBindingSpecApplication(dict):
    def __init__(__self__, *,
                 namespace: str,
                 serviceaccount: str):
        pulumi.set(__self__, "namespace", namespace)
        pulumi.set(__self__, "serviceaccount", serviceaccount)

    @property
    @pulumi.getter
    def namespace(self) -> str:
        return pulumi.get(self, "namespace")

    @property
    @pulumi.getter
    def serviceaccount(self) -> str:
        return pulumi.get(self, "serviceaccount")


@pulumi.output_type
class PolicyBindingStatus(dict):
    @staticmethod
    def __key_warning(key: str):
        suggest = None
        if key == "currentState":
            suggest = "current_state"

        if suggest:
            pulumi.log.warn(f"Key '{key}' not found in PolicyBindingStatus. Access the value via the '{suggest}' property getter instead.")

    def __getitem__(self, key: str) -> Any:
        PolicyBindingStatus.__key_warning(key)
        return super().__getitem__(key)

    def get(self, key: str, default = None) -> Any:
        PolicyBindingStatus.__key_warning(key)
        return super().get(key, default)

    def __init__(__self__, *,
                 current_state: str,
                 usage: 'outputs.PolicyBindingStatusUsage'):
        pulumi.set(__self__, "current_state", current_state)
        pulumi.set(__self__, "usage", usage)

    @property
    @pulumi.getter(name="currentState")
    def current_state(self) -> str:
        return pulumi.get(self, "current_state")

    @property
    @pulumi.getter
    def usage(self) -> 'outputs.PolicyBindingStatusUsage':
        return pulumi.get(self, "usage")


@pulumi.output_type
class PolicyBindingStatusUsage(dict):
    def __init__(__self__, *,
                 authotizations: Optional[int] = None):
        if authotizations is not None:
            pulumi.set(__self__, "authotizations", authotizations)

    @property
    @pulumi.getter
    def authotizations(self) -> Optional[int]:
        return pulumi.get(self, "authotizations")

