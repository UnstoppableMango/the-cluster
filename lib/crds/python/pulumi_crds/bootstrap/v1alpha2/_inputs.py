# coding=utf-8
# *** WARNING: this file was generated by crd2pulumi. ***
# *** Do not edit by hand unless you're certain you know what you are doing! ***

import copy
import warnings
import pulumi
import pulumi.runtime
from typing import Any, Mapping, Optional, Sequence, Union, overload
from ... import _utilities

__all__ = [
    'TalosConfigSpecArgs',
    'TalosConfigStatusArgs',
    'TalosConfigTemplateSpecTemplateSpecArgs',
    'TalosConfigTemplateSpecTemplateArgs',
    'TalosConfigTemplateSpecArgs',
]

@pulumi.input_type
class TalosConfigSpecArgs:
    def __init__(__self__, *,
                 generate_type: pulumi.Input[str],
                 data: Optional[pulumi.Input[str]] = None):
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        pulumi.set(__self__, "generate_type", generate_type)
        if data is not None:
            pulumi.set(__self__, "data", data)

    @property
    @pulumi.getter(name="generateType")
    def generate_type(self) -> pulumi.Input[str]:
        return pulumi.get(self, "generate_type")

    @generate_type.setter
    def generate_type(self, value: pulumi.Input[str]):
        pulumi.set(self, "generate_type", value)

    @property
    @pulumi.getter
    def data(self) -> Optional[pulumi.Input[str]]:
        return pulumi.get(self, "data")

    @data.setter
    def data(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "data", value)


@pulumi.input_type
class TalosConfigStatusArgs:
    def __init__(__self__, *,
                 bootstrap_data: Optional[pulumi.Input[str]] = None,
                 error_message: Optional[pulumi.Input[str]] = None,
                 error_reason: Optional[pulumi.Input[str]] = None,
                 ready: Optional[pulumi.Input[bool]] = None,
                 talos_config: Optional[pulumi.Input[str]] = None):
        """
        TalosConfigStatus defines the observed state of TalosConfig
        :param pulumi.Input[str] bootstrap_data: BootstrapData will be a slice of bootstrap data
        :param pulumi.Input[str] error_message: ErrorMessage will be set on non-retryable errors
        :param pulumi.Input[str] error_reason: ErrorReason will be set on non-retryable errors
        :param pulumi.Input[bool] ready: Ready indicates the BootstrapData field is ready to be consumed
        :param pulumi.Input[str] talos_config: Talos config will be a string containing the config for download
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
    def bootstrap_data(self) -> Optional[pulumi.Input[str]]:
        """
        BootstrapData will be a slice of bootstrap data
        """
        return pulumi.get(self, "bootstrap_data")

    @bootstrap_data.setter
    def bootstrap_data(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "bootstrap_data", value)

    @property
    @pulumi.getter(name="errorMessage")
    def error_message(self) -> Optional[pulumi.Input[str]]:
        """
        ErrorMessage will be set on non-retryable errors
        """
        return pulumi.get(self, "error_message")

    @error_message.setter
    def error_message(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "error_message", value)

    @property
    @pulumi.getter(name="errorReason")
    def error_reason(self) -> Optional[pulumi.Input[str]]:
        """
        ErrorReason will be set on non-retryable errors
        """
        return pulumi.get(self, "error_reason")

    @error_reason.setter
    def error_reason(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "error_reason", value)

    @property
    @pulumi.getter
    def ready(self) -> Optional[pulumi.Input[bool]]:
        """
        Ready indicates the BootstrapData field is ready to be consumed
        """
        return pulumi.get(self, "ready")

    @ready.setter
    def ready(self, value: Optional[pulumi.Input[bool]]):
        pulumi.set(self, "ready", value)

    @property
    @pulumi.getter(name="talosConfig")
    def talos_config(self) -> Optional[pulumi.Input[str]]:
        """
        Talos config will be a string containing the config for download
        """
        return pulumi.get(self, "talos_config")

    @talos_config.setter
    def talos_config(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "talos_config", value)


@pulumi.input_type
class TalosConfigTemplateSpecTemplateSpecArgs:
    def __init__(__self__, *,
                 generate_type: pulumi.Input[str],
                 data: Optional[pulumi.Input[str]] = None):
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        pulumi.set(__self__, "generate_type", generate_type)
        if data is not None:
            pulumi.set(__self__, "data", data)

    @property
    @pulumi.getter(name="generateType")
    def generate_type(self) -> pulumi.Input[str]:
        return pulumi.get(self, "generate_type")

    @generate_type.setter
    def generate_type(self, value: pulumi.Input[str]):
        pulumi.set(self, "generate_type", value)

    @property
    @pulumi.getter
    def data(self) -> Optional[pulumi.Input[str]]:
        return pulumi.get(self, "data")

    @data.setter
    def data(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "data", value)


@pulumi.input_type
class TalosConfigTemplateSpecTemplateArgs:
    def __init__(__self__, *,
                 spec: Optional[pulumi.Input['TalosConfigTemplateSpecTemplateSpecArgs']] = None):
        """
        TalosConfigTemplateResource defines the Template structure
        :param pulumi.Input['TalosConfigTemplateSpecTemplateSpecArgs'] spec: TalosConfigSpec defines the desired state of TalosConfig
        """
        if spec is not None:
            pulumi.set(__self__, "spec", spec)

    @property
    @pulumi.getter
    def spec(self) -> Optional[pulumi.Input['TalosConfigTemplateSpecTemplateSpecArgs']]:
        """
        TalosConfigSpec defines the desired state of TalosConfig
        """
        return pulumi.get(self, "spec")

    @spec.setter
    def spec(self, value: Optional[pulumi.Input['TalosConfigTemplateSpecTemplateSpecArgs']]):
        pulumi.set(self, "spec", value)


@pulumi.input_type
class TalosConfigTemplateSpecArgs:
    def __init__(__self__, *,
                 template: pulumi.Input['TalosConfigTemplateSpecTemplateArgs']):
        """
        TalosConfigTemplateSpec defines the desired state of TalosConfigTemplate
        :param pulumi.Input['TalosConfigTemplateSpecTemplateArgs'] template: TalosConfigTemplateResource defines the Template structure
        """
        pulumi.set(__self__, "template", template)

    @property
    @pulumi.getter
    def template(self) -> pulumi.Input['TalosConfigTemplateSpecTemplateArgs']:
        """
        TalosConfigTemplateResource defines the Template structure
        """
        return pulumi.get(self, "template")

    @template.setter
    def template(self, value: pulumi.Input['TalosConfigTemplateSpecTemplateArgs']):
        pulumi.set(self, "template", value)

