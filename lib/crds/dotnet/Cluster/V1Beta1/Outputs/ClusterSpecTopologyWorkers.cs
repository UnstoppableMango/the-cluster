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
    /// Workers encapsulates the different constructs that form the worker nodes for the cluster.
    /// </summary>
    [OutputType]
    public sealed class ClusterSpecTopologyWorkers
    {
        /// <summary>
        /// MachineDeployments is a list of machine deployments in the cluster.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachineDeployments> MachineDeployments;
        /// <summary>
        /// MachinePools is a list of machine pools in the cluster.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachinePools> MachinePools;

        [OutputConstructor]
        private ClusterSpecTopologyWorkers(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachineDeployments> machineDeployments,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachinePools> machinePools)
        {
            MachineDeployments = machineDeployments;
            MachinePools = machinePools;
        }
    }
}
