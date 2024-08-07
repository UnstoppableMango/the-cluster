// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1
{

    /// <summary>
    /// FailureDomainSpec is the Schema for Cluster API failure domains. It allows controllers to understand how many failure domains a cluster can optionally span across.
    /// </summary>
    [OutputType]
    public sealed class ClusterStatusFailureDomains
    {
        /// <summary>
        /// Attributes is a free form map of attributes an infrastructure provider might use or require.
        /// </summary>
        public readonly ImmutableDictionary<string, string> Attributes;
        /// <summary>
        /// ControlPlane determines if this failure domain is suitable for use by control plane machines.
        /// </summary>
        public readonly bool ControlPlane;

        [OutputConstructor]
        private ClusterStatusFailureDomains(
            ImmutableDictionary<string, string> attributes,

            bool controlPlane)
        {
            Attributes = attributes;
            ControlPlane = controlPlane;
        }
    }
}
