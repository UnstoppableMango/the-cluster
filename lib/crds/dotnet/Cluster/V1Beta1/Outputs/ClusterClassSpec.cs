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
    /// ClusterClassSpec describes the desired state of the ClusterClass.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpec
    {
        /// <summary>
        /// ControlPlane is a reference to a local struct that holds the details for provisioning the Control Plane for the Cluster.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlane ControlPlane;
        /// <summary>
        /// Infrastructure is a reference to a provider-specific template that holds the details for provisioning infrastructure specific cluster for the underlying provider. The underlying provider is responsible for the implementation of the template to an infrastructure cluster.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecInfrastructure Infrastructure;
        /// <summary>
        /// Patches defines the patches which are applied to customize referenced templates of a ClusterClass. Note: Patches will be applied in the order of the array.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatches> Patches;
        /// <summary>
        /// Variables defines the variables which can be configured in the Cluster topology and are then used in patches.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecVariables> Variables;
        /// <summary>
        /// Workers describes the worker nodes for the cluster. It is a collection of node types which can be used to create the worker nodes of the cluster.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkers Workers;

        [OutputConstructor]
        private ClusterClassSpec(
            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlane controlPlane,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecInfrastructure infrastructure,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecPatches> patches,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecVariables> variables,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecWorkers workers)
        {
            ControlPlane = controlPlane;
            Infrastructure = infrastructure;
            Patches = patches;
            Variables = variables;
            Workers = workers;
        }
    }
}