// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2
{

    /// <summary>
    /// ServerSpec defines the desired state of Server.
    /// </summary>
    [OutputType]
    public sealed class ServerSpec
    {
        public readonly bool Accepted;
        /// <summary>
        /// BMC defines data about how to talk to the node via ipmitool.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecBmc Bmc;
        /// <summary>
        /// BootFromDiskMethod specifies the method to exit iPXE to force boot from disk. 
        ///  If not set, controller default is used. Valid values: ipxe-exit, http-404, ipxe-sanboot.
        /// </summary>
        public readonly string BootFromDiskMethod;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecConfigPatches> ConfigPatches;
        public readonly bool Cordoned;
        /// <summary>
        /// ObjectReference contains enough information to let you inspect or modify the referred object. --- New uses of this type are discouraged because of difficulty describing its usage when embedded in APIs. 1. Ignored fields.  It includes many fields which are not generally honored.  For instance, ResourceVersion and FieldPath are both very rarely valid in actual usage. 2. Invalid usage help.  It is impossible to add specific help for individual usage.  In most embedded usages, there are particular restrictions like, "must refer only to types A and B" or "UID not honored" or "name must be restricted". Those cannot be well described when embedded. 3. Inconsistent validation.  Because the usages are different, the validation rules are different by usage, which makes it hard for users to predict what will happen. 4. The fields are both imprecise and overly precise.  Kind is not a precise mapping to a URL. This can produce ambiguity during interpretation and require a REST mapping.  In most cases, the dependency is on the group,resource tuple and the version of the actual struct is irrelevant. 5. We cannot easily change it.  Because this type is embedded in many locations, updates to this type will affect numerous schemas.  Don't make new APIs embed an underspecified API type they do not control. 
        ///  Instead of using this type, create a locally provided and used type that is well-focused on your reference. For example, ServiceReferences for admission registration: https://github.com/kubernetes/api/blob/release-1.17/admissionregistration/v1/types.go#L533 .
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecEnvironmentRef EnvironmentRef;
        public readonly Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecHardware Hardware;
        public readonly string Hostname;
        /// <summary>
        /// ManagementAPI defines data about how to talk to the node via simple HTTP API.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecManagementApi ManagementApi;
        public readonly bool PxeBootAlways;
        /// <summary>
        /// PXEMode specifies the method to trigger PXE boot via IPMI. 
        ///  If not set, controller default is used. Valid values: uefi, bios.
        /// </summary>
        public readonly string PxeMode;

        [OutputConstructor]
        private ServerSpec(
            bool accepted,

            Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecBmc bmc,

            string bootFromDiskMethod,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecConfigPatches> configPatches,

            bool cordoned,

            Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecEnvironmentRef environmentRef,

            Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecHardware hardware,

            string hostname,

            Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2.ServerSpecManagementApi managementApi,

            bool pxeBootAlways,

            string pxeMode)
        {
            Accepted = accepted;
            Bmc = bmc;
            BootFromDiskMethod = bootFromDiskMethod;
            ConfigPatches = configPatches;
            Cordoned = cordoned;
            EnvironmentRef = environmentRef;
            Hardware = hardware;
            Hostname = hostname;
            ManagementApi = managementApi;
            PxeBootAlways = pxeBootAlways;
            PxeMode = pxeMode;
        }
    }
}