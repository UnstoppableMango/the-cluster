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
    /// ControlPlane is a reference to a local struct that holds the details for provisioning the Control Plane for the Cluster.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecControlPlane
    {
        /// <summary>
        /// MachineTemplate defines the metadata and infrastructure information for control plane machines. 
        ///  This field is supported if and only if the control plane provider template referenced above is Machine based and supports setting replicas.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneMachineInfrastructure MachineInfrastructure;
        /// <summary>
        /// Metadata is the metadata applied to the machines of the ControlPlane. At runtime this metadata is merged with the corresponding metadata from the topology. 
        ///  This field is supported if and only if the control plane provider template referenced is Machine based.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneMetadata Metadata;
        /// <summary>
        /// Ref is a required reference to a custom resource offered by a provider.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneRef Ref;

        [OutputConstructor]
        private ClusterClassSpecControlPlane(
            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneMachineInfrastructure machineInfrastructure,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneMetadata metadata,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterClassSpecControlPlaneRef @ref)
        {
            MachineInfrastructure = machineInfrastructure;
            Metadata = metadata;
            Ref = @ref;
        }
    }
}
