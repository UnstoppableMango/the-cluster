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
    'TalosConfigSpec',
    'TalosConfigStatus',
    'TalosConfigTemplateSpec',
    'TalosConfigTemplateSpecTemplate',
    'TalosConfigTemplateSpecTemplateSpec',
]

@pulumi.output_type
class TalosConfigSpec(dict):
    """
    TalosConfigSpec defines the desired state of TalosConfig
    """
    @staticmethod
    def __key_warning(key: str):
        suggest = None
        if key == "generateType":
            suggest = "generate_type"

        if suggest:
            pulumi.log.warn(f"Key '{key}' not found in TalosConfigSpec. Access the value via the '{suggest}' property getter instead.")

    def __getitem__(self, key: str) -> Any:
        TalosConfigSpec.__key_warning(key)
        return super().__getitem__(key)

    def get(self, key: str, default = None) -> Any:
        TalosConfigSpec.__key_warning(key)
        return super().get(key, default)

    def __init__(__self__, *,
                 generate_type: str,
                 data: Optional[str] = None):
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        pulumi.set(__self__, "generate_type", generate_type)
        if data is not None:
            pulumi.set(__self__, "data", data)

    @property
    @pulumi.getter(name="generateType")
    def generate_type(self) -> str:
        return pulumi.get(self, "generate_type")

    @property
    @pulumi.getter
    def data(self) -> Optional[str]:
        return pulumi.get(self, "data")


@pulumi.output_type
class TalosConfigStatus(dict):
    """
    TalosConfigStatus defines the observed state of TalosConfig
    """
    @staticmethod
    def __key_warning(key: str):
        suggest = None
        if key == "bootstrapData":
            suggest = "bootstrap_data"
        elif key == "errorMessage":
            suggest = "error_message"
        elif key == "errorReason":
            suggest = "error_reason"
        elif key == "talosConfig":
            suggest = "talos_config"

        if suggest:
            pulumi.log.warn(f"Key '{key}' not found in TalosConfigStatus. Access the value via the '{suggest}' property getter instead.")

    def __getitem__(self, key: str) -> Any:
        TalosConfigStatus.__key_warning(key)
        return super().__getitem__(key)

    def get(self, key: str, default = None) -> Any:
        TalosConfigStatus.__key_warning(key)
        return super().get(key, default)

    def __init__(__self__, *,
                 bootstrap_data: Optional[str] = None,
                 error_message: Optional[str] = None,
                 error_reason: Optional[str] = None,
                 ready: Optional[bool] = None,
                 talos_config: Optional[str] = None):
        """
        TalosConfigStatus defines the observed state of TalosConfig
        :param str bootstrap_data: BootstrapData will be a slice of bootstrap data
        :param str error_message: ErrorMessage will be set on non-retryable errors
        :param str error_reason: ErrorReason will be set on non-retryable errors
        :param bool ready: Ready indicates the BootstrapData field is ready to be consumed
        :param str talos_config: Talos config will be a string containing the config for download
        """
        if bootstrap_data is not None:
            pulumi.set(__self__, "bootstrap_data", bootstrap_data)
        if error_message is not None:
            pulumi.set(__self__, "error_message", error_message)
        if error_reason is not None:
            pulumi.set(__self__, "error_reason", error_reason)
        if ready is not None:
            pulumi.set(__self__, "ready", ready)
        if talos_config is not None:
            pulumi.set(__self__, "talos_config", talos_config)

    @property
    @pulumi.getter(name="bootstrapData")
    def bootstrap_data(self) -> Optional[str]:
        """
        BootstrapData will be a slice of bootstrap data
        """
        return pulumi.get(self, "bootstrap_data")

    @property
    @pulumi.getter(name="errorMessage")
    def error_message(self) -> Optional[str]:
        """
        ErrorMessage will be set on non-retryable errors
        """
        return pulumi.get(self, "error_message")

    @property
    @pulumi.getter(name="errorReason")
    def error_reason(self) -> Optional[str]:
        """
        ErrorReason will be set on non-retryable errors
        """
        return pulumi.get(self, "error_reason")

    @property
    @pulumi.getter
    def ready(self) -> Optional[bool]:
        """
        Ready indicates the BootstrapData field is ready to be consumed
        """
        return pulumi.get(self, "ready")

    @property
    @pulumi.getter(name="talosConfig")
    def talos_config(self) -> Optional[str]:
        """
        Talos config will be a string containing the config for download
        """
        return pulumi.get(self, "talos_config")


@pulumi.output_type
class TalosConfigTemplateSpec(dict):
    """
    TalosConfigTemplateSpec defines the desired state of TalosConfigTemplate
    """
    def __init__(__self__, *,
                 template: 'outputs.TalosConfigTemplateSpecTemplate'):
        """
        TalosConfigTemplateSpec defines the desired state of TalosConfigTemplate
        :param 'TalosConfigTemplateSpecTemplateArgs' template: TalosConfigTemplateResource defines the Template structure
        """
        pulumi.set(__self__, "template", template)

    @property
    @pulumi.getter
    def template(self) -> 'outputs.TalosConfigTemplateSpecTemplate':
        """
        TalosConfigTemplateResource defines the Template structure
        """
        return pulumi.get(self, "template")


@pulumi.output_type
class TalosConfigTemplateSpecTemplate(dict):
    """
    TalosConfigTemplateResource defines the Template structure
    """
    def __init__(__self__, *,
                 spec: Optional['outputs.TalosConfigTemplateSpecTemplateSpec'] = None):
        """
        TalosConfigTemplateResource defines the Template structure
        :param 'TalosConfigTemplateSpecTemplateSpecArgs' spec: TalosConfigSpec defines the desired state of TalosConfig
        """
        if spec is not None:
            pulumi.set(__self__, "spec", spec)

    @property
    @pulumi.getter
    def spec(self) -> Optional['outputs.TalosConfigTemplateSpecTemplateSpec']:
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        return pulumi.get(self, "spec")


@pulumi.output_type
class TalosConfigTemplateSpecTemplateSpec(dict):
    """
    TalosConfigSpec defines the desired state of TalosConfig
    """
    @staticmethod
    def __key_warning(key: str):
        suggest = None
        if key == "generateType":
            suggest = "generate_type"

        if suggest:
            pulumi.log.warn(f"Key '{key}' not found in TalosConfigTemplateSpecTemplateSpec. Access the value via the '{suggest}' property getter instead.")

    def __getitem__(self, key: str) -> Any:
        TalosConfigTemplateSpecTemplateSpec.__key_warning(key)
        return super().__getitem__(key)

    def get(self, key: str, default = None) -> Any:
        TalosConfigTemplateSpecTemplateSpec.__key_warning(key)
        return super().get(key, default)

    def __init__(__self__, *,
                 generate_type: str,
                 data: Optional[str] = None):
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        pulumi.set(__self__, "generate_type", generate_type)
        if data is not None:
            pulumi.set(__self__, "data", data)

    @property
    @pulumi.getter(name="generateType")
    def generate_type(self) -> str:
        return pulumi.get(self, "generate_type")

    @property
    @pulumi.getter
    def data(self) -> Optional[str]:
        return pulumi.get(self, "data")

