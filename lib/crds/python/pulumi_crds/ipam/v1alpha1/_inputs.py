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
    'IPAddressClaimSpecPoolRefArgs',
    'IPAddressClaimSpecArgs',
    'IPAddressClaimStatusAddressRefArgs',
    'IPAddressClaimStatusConditionsArgs',
    'IPAddressClaimStatusArgs',
    'IPAddressSpecClaimRefArgs',
    'IPAddressSpecPoolRefArgs',
    'IPAddressSpecArgs',
]

@pulumi.input_type
class IPAddressClaimSpecPoolRefArgs:
    def __init__(__self__, *,
                 api_group: pulumi.Input[str],
                 kind: pulumi.Input[str],
                 name: pulumi.Input[str]):
        """
        PoolRef is a reference to the pool from which an IP address should be created.
        :param pulumi.Input[str] api_group: APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
        :param pulumi.Input[str] kind: Kind is the type of resource being referenced
        :param pulumi.Input[str] name: Name is the name of resource being referenced
        """
        pulumi.set(__self__, "api_group", api_group)
        pulumi.set(__self__, "kind", kind)
        pulumi.set(__self__, "name", name)

    @property
    @pulumi.getter(name="apiGroup")
    def api_group(self) -> pulumi.Input[str]:
        """
        APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
        """
        return pulumi.get(self, "api_group")

    @api_group.setter
    def api_group(self, value: pulumi.Input[str]):
        pulumi.set(self, "api_group", value)

    @property
    @pulumi.getter
    def kind(self) -> pulumi.Input[str]:
        """
        Kind is the type of resource being referenced
        """
        return pulumi.get(self, "kind")

    @kind.setter
    def kind(self, value: pulumi.Input[str]):
        pulumi.set(self, "kind", value)

    @property
    @pulumi.getter
    def name(self) -> pulumi.Input[str]:
        """
        Name is the name of resource being referenced
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: pulumi.Input[str]):
        pulumi.set(self, "name", value)


@pulumi.input_type
class IPAddressClaimSpecArgs:
    def __init__(__self__, *,
                 pool_ref: pulumi.Input['IPAddressClaimSpecPoolRefArgs']):
        """
        IPAddressClaimSpec is the desired state of an IPAddressClaim.
        :param pulumi.Input['IPAddressClaimSpecPoolRefArgs'] pool_ref: PoolRef is a reference to the pool from which an IP address should be created.
        """
        pulumi.set(__self__, "pool_ref", pool_ref)

    @property
    @pulumi.getter(name="poolRef")
    def pool_ref(self) -> pulumi.Input['IPAddressClaimSpecPoolRefArgs']:
        """
        PoolRef is a reference to the pool from which an IP address should be created.
        """
        return pulumi.get(self, "pool_ref")

    @pool_ref.setter
    def pool_ref(self, value: pulumi.Input['IPAddressClaimSpecPoolRefArgs']):
        pulumi.set(self, "pool_ref", value)


@pulumi.input_type
class IPAddressClaimStatusAddressRefArgs:
    def __init__(__self__, *,
                 name: Optional[pulumi.Input[str]] = None):
        """
        AddressRef is a reference to the address that was created for this claim.
        :param pulumi.Input[str] name: Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        """
        if name is not None:
            pulumi.set(__self__, "name", name)

    @property
    @pulumi.getter
    def name(self) -> Optional[pulumi.Input[str]]:
        """
        Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "name", value)


@pulumi.input_type
class IPAddressClaimStatusConditionsArgs:
    def __init__(__self__, *,
                 last_transition_time: pulumi.Input[str],
                 status: pulumi.Input[str],
                 type: pulumi.Input[str],
                 message: Optional[pulumi.Input[str]] = None,
                 reason: Optional[pulumi.Input[str]] = None,
                 severity: Optional[pulumi.Input[str]] = None):
        """
        Condition defines an observation of a Cluster API resource operational state.
        :param pulumi.Input[str] last_transition_time: Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
        :param pulumi.Input[str] status: Status of the condition, one of True, False, Unknown.
        :param pulumi.Input[str] type: Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
        :param pulumi.Input[str] message: A human readable message indicating details about the transition. This field may be empty.
        :param pulumi.Input[str] reason: The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
        :param pulumi.Input[str] severity: Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
        """
        pulumi.set(__self__, "last_transition_time", last_transition_time)
        pulumi.set(__self__, "status", status)
        pulumi.set(__self__, "type", type)
        if message is not None:
            pulumi.set(__self__, "message", message)
        if reason is not None:
            pulumi.set(__self__, "reason", reason)
        if severity is not None:
            pulumi.set(__self__, "severity", severity)

    @property
    @pulumi.getter(name="lastTransitionTime")
    def last_transition_time(self) -> pulumi.Input[str]:
        """
        Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
        """
        return pulumi.get(self, "last_transition_time")

    @last_transition_time.setter
    def last_transition_time(self, value: pulumi.Input[str]):
        pulumi.set(self, "last_transition_time", value)

    @property
    @pulumi.getter
    def status(self) -> pulumi.Input[str]:
        """
        Status of the condition, one of True, False, Unknown.
        """
        return pulumi.get(self, "status")

    @status.setter
    def status(self, value: pulumi.Input[str]):
        pulumi.set(self, "status", value)

    @property
    @pulumi.getter
    def type(self) -> pulumi.Input[str]:
        """
        Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
        """
        return pulumi.get(self, "type")

    @type.setter
    def type(self, value: pulumi.Input[str]):
        pulumi.set(self, "type", value)

    @property
    @pulumi.getter
    def message(self) -> Optional[pulumi.Input[str]]:
        """
        A human readable message indicating details about the transition. This field may be empty.
        """
        return pulumi.get(self, "message")

    @message.setter
    def message(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "message", value)

    @property
    @pulumi.getter
    def reason(self) -> Optional[pulumi.Input[str]]:
        """
        The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
        """
        return pulumi.get(self, "reason")

    @reason.setter
    def reason(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "reason", value)

    @property
    @pulumi.getter
    def severity(self) -> Optional[pulumi.Input[str]]:
        """
        Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
        """
        return pulumi.get(self, "severity")

    @severity.setter
    def severity(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "severity", value)


@pulumi.input_type
class IPAddressClaimStatusArgs:
    def __init__(__self__, *,
                 address_ref: Optional[pulumi.Input['IPAddressClaimStatusAddressRefArgs']] = None,
                 conditions: Optional[pulumi.Input[Sequence[pulumi.Input['IPAddressClaimStatusConditionsArgs']]]] = None):
        """
        IPAddressClaimStatus is the observed status of a IPAddressClaim.
        :param pulumi.Input['IPAddressClaimStatusAddressRefArgs'] address_ref: AddressRef is a reference to the address that was created for this claim.
        :param pulumi.Input[Sequence[pulumi.Input['IPAddressClaimStatusConditionsArgs']]] conditions: Conditions summarises the current state of the IPAddressClaim
        """
        if address_ref is not None:
            pulumi.set(__self__, "address_ref", address_ref)
        if conditions is not None:
            pulumi.set(__self__, "conditions", conditions)

    @property
    @pulumi.getter(name="addressRef")
    def address_ref(self) -> Optional[pulumi.Input['IPAddressClaimStatusAddressRefArgs']]:
        """
        AddressRef is a reference to the address that was created for this claim.
        """
        return pulumi.get(self, "address_ref")

    @address_ref.setter
    def address_ref(self, value: Optional[pulumi.Input['IPAddressClaimStatusAddressRefArgs']]):
        pulumi.set(self, "address_ref", value)

    @property
    @pulumi.getter
    def conditions(self) -> Optional[pulumi.Input[Sequence[pulumi.Input['IPAddressClaimStatusConditionsArgs']]]]:
        """
        Conditions summarises the current state of the IPAddressClaim
        """
        return pulumi.get(self, "conditions")

    @conditions.setter
    def conditions(self, value: Optional[pulumi.Input[Sequence[pulumi.Input['IPAddressClaimStatusConditionsArgs']]]]):
        pulumi.set(self, "conditions", value)


@pulumi.input_type
class IPAddressSpecClaimRefArgs:
    def __init__(__self__, *,
                 name: Optional[pulumi.Input[str]] = None):
        """
        ClaimRef is a reference to the claim this IPAddress was created for.
        :param pulumi.Input[str] name: Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        """
        if name is not None:
            pulumi.set(__self__, "name", name)

    @property
    @pulumi.getter
    def name(self) -> Optional[pulumi.Input[str]]:
        """
        Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "name", value)


@pulumi.input_type
class IPAddressSpecPoolRefArgs:
    def __init__(__self__, *,
                 api_group: pulumi.Input[str],
                 kind: pulumi.Input[str],
                 name: pulumi.Input[str]):
        """
        PoolRef is a reference to the pool that this IPAddress was created from.
        :param pulumi.Input[str] api_group: APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
        :param pulumi.Input[str] kind: Kind is the type of resource being referenced
        :param pulumi.Input[str] name: Name is the name of resource being referenced
        """
        pulumi.set(__self__, "api_group", api_group)
        pulumi.set(__self__, "kind", kind)
        pulumi.set(__self__, "name", name)

    @property
    @pulumi.getter(name="apiGroup")
    def api_group(self) -> pulumi.Input[str]:
        """
        APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
        """
        return pulumi.get(self, "api_group")

    @api_group.setter
    def api_group(self, value: pulumi.Input[str]):
        pulumi.set(self, "api_group", value)

    @property
    @pulumi.getter
    def kind(self) -> pulumi.Input[str]:
        """
        Kind is the type of resource being referenced
        """
        return pulumi.get(self, "kind")

    @kind.setter
    def kind(self, value: pulumi.Input[str]):
        pulumi.set(self, "kind", value)

    @property
    @pulumi.getter
    def name(self) -> pulumi.Input[str]:
        """
        Name is the name of resource being referenced
        """
        return pulumi.get(self, "name")

    @name.setter
    def name(self, value: pulumi.Input[str]):
        pulumi.set(self, "name", value)


@pulumi.input_type
class IPAddressSpecArgs:
    def __init__(__self__, *,
                 address: pulumi.Input[str],
                 claim_ref: pulumi.Input['IPAddressSpecClaimRefArgs'],
                 pool_ref: pulumi.Input['IPAddressSpecPoolRefArgs'],
                 prefix: pulumi.Input[int],
                 gateway: Optional[pulumi.Input[str]] = None):
        """
        IPAddressSpec is the desired state of an IPAddress.
        :param pulumi.Input[str] address: Address is the IP address.
        :param pulumi.Input['IPAddressSpecClaimRefArgs'] claim_ref: ClaimRef is a reference to the claim this IPAddress was created for.
        :param pulumi.Input['IPAddressSpecPoolRefArgs'] pool_ref: PoolRef is a reference to the pool that this IPAddress was created from.
        :param pulumi.Input[int] prefix: Prefix is the prefix of the address.
        :param pulumi.Input[str] gateway: Gateway is the network gateway of the network the address is from.
        """
        pulumi.set(__self__, "address", address)
        pulumi.set(__self__, "claim_ref", claim_ref)
        pulumi.set(__self__, "pool_ref", pool_ref)
        pulumi.set(__self__, "prefix", prefix)
        if gateway is not None:
            pulumi.set(__self__, "gateway", gateway)

    @property
    @pulumi.getter
    def address(self) -> pulumi.Input[str]:
        """
        Address is the IP address.
        """
        return pulumi.get(self, "address")

    @address.setter
    def address(self, value: pulumi.Input[str]):
        pulumi.set(self, "address", value)

    @property
    @pulumi.getter(name="claimRef")
    def claim_ref(self) -> pulumi.Input['IPAddressSpecClaimRefArgs']:
        """
        ClaimRef is a reference to the claim this IPAddress was created for.
        """
        return pulumi.get(self, "claim_ref")

    @claim_ref.setter
    def claim_ref(self, value: pulumi.Input['IPAddressSpecClaimRefArgs']):
        pulumi.set(self, "claim_ref", value)

    @property
    @pulumi.getter(name="poolRef")
    def pool_ref(self) -> pulumi.Input['IPAddressSpecPoolRefArgs']:
        """
        PoolRef is a reference to the pool that this IPAddress was created from.
        """
        return pulumi.get(self, "pool_ref")

    @pool_ref.setter
    def pool_ref(self, value: pulumi.Input['IPAddressSpecPoolRefArgs']):
        pulumi.set(self, "pool_ref", value)

    @property
    @pulumi.getter
    def prefix(self) -> pulumi.Input[int]:
        """
        Prefix is the prefix of the address.
        """
        return pulumi.get(self, "prefix")

    @prefix.setter
    def prefix(self, value: pulumi.Input[int]):
        pulumi.set(self, "prefix", value)

    @property
    @pulumi.getter
    def gateway(self) -> Optional[pulumi.Input[str]]:
        """
        Gateway is the network gateway of the network the address is from.
        """
        return pulumi.get(self, "gateway")

    @gateway.setter
    def gateway(self, value: Optional[pulumi.Input[str]]):
        pulumi.set(self, "gateway", value)

