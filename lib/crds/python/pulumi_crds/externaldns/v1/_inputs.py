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
    'DNSEndpointSpecEndpointsProviderSpecificArgs',
    'DNSEndpointSpecEndpointsArgs',
    'DNSEndpointSpecArgs',
    'DNSEndpointStatusArgs',
]

@pulumi.input_type
class DNSEndpointSpecEndpointsProviderSpecificArgs:
    def __init__(__self__, *,
                 name: Optional[pulumi.Input[str]] = None,
                 value: Optional[pulumi.Input[str]] = None):
        """
        ProviderSpecificProperty represents provider specific config property.
        :param pulumi.Input[str] name: Name of the property
        :param pulumi.Input[str] value: Value of the property
        """
        if name is not None:
            pulumi.set(__self__, "name", name)
        if value is not None:
            pulumi.set(__self__, "value", value)

    @property
    @pulumi.getter
    def name(self) -> Optional[pulumi.Input[str]]:
        """
        Name of the property
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "name", value)

    @property
    @pulumi.getter
    def value(self) -> Optional[pulumi.Input[str]]:
        """
        Value of the property
        """
        return pulumi.get(self, "value")

    @value.setter
    def value(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "value", value)


@pulumi.input_type
class DNSEndpointSpecEndpointsArgs:
    def __init__(__self__, *,
                 dns_name: Optional[pulumi.Input[str]] = None,
                 labels: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]] = None,
                 provider_specific: Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsProviderSpecificArgs']]]] = None,
                 record_ttl: Optional[pulumi.Input[int]] = None,
                 record_type: Optional[pulumi.Input[str]] = None,
                 targets: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]] = None):
        """
        Endpoint describes DNS Endpoint.
        :param pulumi.Input[str] dns_name: The hostname for the DNS record
        :param pulumi.Input[Mapping[str, pulumi.Input[str]]] labels: Labels stores labels defined for the Endpoint
        :param pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsProviderSpecificArgs']]] provider_specific: ProviderSpecific stores provider specific config
        :param pulumi.Input[int] record_ttl: TTL for the record
        :param pulumi.Input[str] record_type: RecordType type of record, e.g. CNAME, A, SRV, TXT, MX
        :param pulumi.Input[Sequence[pulumi.Input[str]]] targets: The targets the DNS service points to
        """
        if dns_name is not None:
            pulumi.set(__self__, "dns_name", dns_name)
        if labels is not None:
            pulumi.set(__self__, "labels", labels)
        if provider_specific is not None:
            pulumi.set(__self__, "provider_specific", provider_specific)
        if record_ttl is not None:
            pulumi.set(__self__, "record_ttl", record_ttl)
        if record_type is not None:
            pulumi.set(__self__, "record_type", record_type)
        if targets is not None:
            pulumi.set(__self__, "targets", targets)

    @property
    @pulumi.getter(name="dnsName")
    def dns_name(self) -> Optional[pulumi.Input[str]]:
        """
        The hostname for the DNS record
        """
        return pulumi.get(self, "dns_name")

    @dns_name.setter
    def dns_name(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "dns_name", value)

    @property
    @pulumi.getter
    def labels(self) -> Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]]:
        """
        Labels stores labels defined for the Endpoint
        """
        return pulumi.get(self, "labels")

    @labels.setter
    def labels(self, value: Optional[pulumi.Input[Mapping[str, pulumi.Input[str]]]]):
        pulumi.set(self, "labels", value)

    @property
    @pulumi.getter(name="providerSpecific")
    def provider_specific(self) -> Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsProviderSpecificArgs']]]]:
        """
        ProviderSpecific stores provider specific config
        """
        return pulumi.get(self, "provider_specific")

    @provider_specific.setter
    def provider_specific(self, value: Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsProviderSpecificArgs']]]]):
        pulumi.set(self, "provider_specific", value)

    @property
    @pulumi.getter(name="recordTTL")
    def record_ttl(self) -> Optional[pulumi.Input[int]]:
        """
        TTL for the record
        """
        return pulumi.get(self, "record_ttl")

    @record_ttl.setter
    def record_ttl(self, value: Optional[pulumi.Input[int]]):
        pulumi.set(self, "record_ttl", value)

    @property
    @pulumi.getter(name="recordType")
    def record_type(self) -> Optional[pulumi.Input[str]]:
        """
        RecordType type of record, e.g. CNAME, A, SRV, TXT, MX
        """
        return pulumi.get(self, "record_type")

    @record_type.setter
    def record_type(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "record_type", value)

    @property
    @pulumi.getter
    def targets(self) -> Optional[pulumi.Input[Sequence[pulumi.Input[str]]]]:
        """
        The targets the DNS service points to
        """
        return pulumi.get(self, "targets")

    @targets.setter
    def targets(self, value: Optional[pulumi.Input[Sequence[pulumi.Input[str]]]]):
        pulumi.set(self, "targets", value)


@pulumi.input_type
class DNSEndpointSpecArgs:
    def __init__(__self__, *,
                 endpoints: Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsArgs']]]] = None):
        """
        DNSEndpointSpec holds information about endpoints.
        """
        if endpoints is not None:
            pulumi.set(__self__, "endpoints", endpoints)

    @property
    @pulumi.getter
    def endpoints(self) -> Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsArgs']]]]:
        return pulumi.get(self, "endpoints")

    @endpoints.setter
    def endpoints(self, value: Optional[pulumi.Input[Sequence[pulumi.Input['DNSEndpointSpecEndpointsArgs']]]]):
        pulumi.set(self, "endpoints", value)


@pulumi.input_type
class DNSEndpointStatusArgs:
    def __init__(__self__, *,
                 observed_generation: Optional[pulumi.Input[int]] = None):
        """
        DNSEndpointStatus represents generation observed by the external dns controller.
        :param pulumi.Input[int] observed_generation: The generation observed by by the external-dns controller.
        """
        if observed_generation is not None:
            pulumi.set(__self__, "observed_generation", observed_generation)

    @property
    @pulumi.getter(name="observedGeneration")
    def observed_generation(self) -> Optional[pulumi.Input[int]]:
        """
        The generation observed by by the external-dns controller.
        """
        return pulumi.get(self, "observed_generation")

    @observed_generation.setter
    def observed_generation(self, value: Optional[pulumi.Input[int]]):
        pulumi.set(self, "observed_generation", value)

