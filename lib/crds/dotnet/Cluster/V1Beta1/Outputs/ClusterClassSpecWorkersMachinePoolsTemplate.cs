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
    /// Template is a local struct containing a collection of templates for creation of MachinePools objects representing a pool of worker nodes.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecWorkersMachinePoolsTemplate
    {
        /// <summary>
        /// Bootstrap contains the bootstrap template reference to be used for the creation of the Machines in the MachinePool.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateBootstrap Bootstrap;
        /// <summary>
        /// Infrastructure contains the infrastructure template reference to be used for the creation of the MachinePool.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateInfrastructure Infrastructure;
        /// <summary>
        /// Metadata is the metadata applied to the MachinePool. At runtime this metadata is merged with the corresponding metadata from the topology.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateMetadata Metadata;

        [OutputConstructor]
        private ClusterClassSpecWorkersMachinePoolsTemplate(
            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateBootstrap bootstrap,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateInfrastructure infrastructure,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkersMachinePoolsTemplateMetadata metadata)
        {
            Bootstrap = bootstrap;
            Infrastructure = infrastructure;
            Metadata = metadata;
        }
    }
}