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
    /// MachinePoolClass serves as a template to define a pool of worker nodes of the cluster provisioned using `ClusterClass`.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecWorkersMachinePools
    {
        /// <summary>
        /// Class denotes a type of machine pool present in the cluster, this name MUST be unique within a ClusterClass and can be referenced in the Cluster to create a managed MachinePool.
        /// </summary>
        public readonly string Class;
        /// <summary>
        /// FailureDomains is the list of failure domains the MachinePool should be attached to. Must match a key in the FailureDomains map stored on the cluster object. NOTE: This value can be overridden while defining a Cluster.Topology using this MachinePoolClass.
        /// </summary>
        public readonly ImmutableArray<string> FailureDomains;
        /// <summary>
        /// Minimum number of seconds for which a newly created machine pool should be ready. Defaults to 0 (machine will be considered available as soon as it is ready) NOTE: This value can be overridden while defining a Cluster.Topology using this MachinePoolClass.
        /// </summary>
        public readonly int MinReadySeconds;
        /// <summary>
        /// NamingStrategy allows changing the naming pattern used when creating the MachinePool.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsNamingStrategy NamingStrategy;
        /// <summary>
        /// NodeDeletionTimeout defines how long the controller will attempt to delete the Node that the Machine hosts after the Machine Pool is marked for deletion. A duration of 0 will retry deletion indefinitely. Defaults to 10 seconds. NOTE: This value can be overridden while defining a Cluster.Topology using this MachinePoolClass.
        /// </summary>
        public readonly string NodeDeletionTimeout;
        /// <summary>
        /// NodeDrainTimeout is the total amount of time that the controller will spend on draining a node. The default value is 0, meaning that the node can be drained without any time limitations. NOTE: NodeDrainTimeout is different from `kubectl drain --timeout` NOTE: This value can be overridden while defining a Cluster.Topology using this MachinePoolClass.
        /// </summary>
        public readonly string NodeDrainTimeout;
        /// <summary>
        /// NodeVolumeDetachTimeout is the total amount of time that the controller will spend on waiting for all volumes to be detached. The default value is 0, meaning that the volumes can be detached without any time limitations. NOTE: This value can be overridden while defining a Cluster.Topology using this MachinePoolClass.
        /// </summary>
        public readonly string NodeVolumeDetachTimeout;
        /// <summary>
        /// Template is a local struct containing a collection of templates for creation of MachinePools objects representing a pool of worker nodes.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplate Template;

        [OutputConstructor]
        private ClusterClassSpecWorkersMachinePools(
            string @class,

            ImmutableArray<string> failureDomains,

            int minReadySeconds,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsNamingStrategy namingStrategy,

            string nodeDeletionTimeout,

            string nodeDrainTimeout,

            string nodeVolumeDetachTimeout,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplate template)
        {
            Class = @class;
            FailureDomains = failureDomains;
            MinReadySeconds = minReadySeconds;
            NamingStrategy = namingStrategy;
            NodeDeletionTimeout = nodeDeletionTimeout;
            NodeDrainTimeout = nodeDrainTimeout;
            NodeVolumeDetachTimeout = nodeVolumeDetachTimeout;
            Template = template;
        }
    }
}
