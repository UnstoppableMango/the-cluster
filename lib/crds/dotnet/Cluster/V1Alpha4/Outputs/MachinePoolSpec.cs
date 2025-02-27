// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4
{

    /// <summary>
    /// MachinePoolSpec defines the desired state of MachinePool.
    /// </summary>
    [OutputType]
    public sealed class MachinePoolSpec
    {
        /// <summary>
        /// ClusterName is the name of the Cluster this object belongs to.
        /// </summary>
        public readonly string ClusterName;
        /// <summary>
        /// FailureDomains is the list of failure domains this MachinePool should be attached to.
        /// </summary>
        public readonly ImmutableArray<string> FailureDomains;
        /// <summary>
        /// Minimum number of seconds for which a newly created machine instances should be ready. Defaults to 0 (machine instance will be considered available as soon as it is ready)
        /// </summary>
        public readonly int MinReadySeconds;
        /// <summary>
        /// ProviderIDList are the identification IDs of machine instances provided by the provider. This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
        /// </summary>
        public readonly ImmutableArray<string> ProviderIDList;
        /// <summary>
        /// Number of desired machines. Defaults to 1. This is a pointer to distinguish between explicit zero and not specified.
        /// </summary>
        public readonly int Replicas;
        /// <summary>
        /// Template describes the machines that will be created.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplate Template;

        [OutputConstructor]
        private MachinePoolSpec(
            string clusterName,

            ImmutableArray<string> failureDomains,

            int minReadySeconds,

            ImmutableArray<string> providerIDList,

            int replicas,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplate template)
        {
            ClusterName = clusterName;
            FailureDomains = failureDomains;
            MinReadySeconds = minReadySeconds;
            ProviderIDList = providerIDList;
            Replicas = replicas;
            Template = template;
        }
    }
}
