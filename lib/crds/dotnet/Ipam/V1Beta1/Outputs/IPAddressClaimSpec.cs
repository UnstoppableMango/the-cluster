// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Ipam.V1Beta1
{

    /// <summary>
    /// IPAddressClaimSpec is the desired state of an IPAddressClaim.
    /// </summary>
    [OutputType]
    public sealed class IPAddressClaimSpec
    {
        /// <summary>
        /// PoolRef is a reference to the pool from which an IP address should be created.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Ipam.V1Beta1.IPAddressClaimSpecPoolRef PoolRef;

        [OutputConstructor]
        private IPAddressClaimSpec(Pulumi.Kubernetes.Types.Outputs.Ipam.V1Beta1.IPAddressClaimSpecPoolRef poolRef)
        {
            PoolRef = poolRef;
        }
    }
}