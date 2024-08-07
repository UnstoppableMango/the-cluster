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
    /// ControlPlane is a reference to a local struct that holds the details for provisioning the Control Plane for the Cluster.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecControlPlane
    {
        /// <summary>
        /// MachineHealthCheck defines a MachineHealthCheck for this ControlPlaneClass. This field is supported if and only if the ControlPlane provider template referenced above is Machine based and supports setting replicas.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMachineHealthCheck MachineHealthCheck;
        /// <summary>
        /// MachineInfrastructure defines the metadata and infrastructure information for control plane machines. 
        ///  This field is supported if and only if the control plane provider template referenced above is Machine based and supports setting replicas.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMachineInfrastructure MachineInfrastructure;
        /// <summary>
        /// Metadata is the metadata applied to the ControlPlane and the Machines of the ControlPlane if the ControlPlaneTemplate referenced is machine based. If not, it is applied only to the ControlPlane. At runtime this metadata is merged with the corresponding metadata from the topology. 
        ///  This field is supported if and only if the control plane provider template referenced is Machine based.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMetadata Metadata;
        /// <summary>
        /// NamingStrategy allows changing the naming pattern used when creating the control plane provider object.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneNamingStrategy NamingStrategy;
        /// <summary>
        /// NodeDeletionTimeout defines how long the controller will attempt to delete the Node that the Machine hosts after the Machine is marked for deletion. A duration of 0 will retry deletion indefinitely. Defaults to 10 seconds. NOTE: This value can be overridden while defining a Cluster.Topology.
        /// </summary>
        public readonly string NodeDeletionTimeout;
        /// <summary>
        /// NodeDrainTimeout is the total amount of time that the controller will spend on draining a node. The default value is 0, meaning that the node can be drained without any time limitations. NOTE: NodeDrainTimeout is different from `kubectl drain --timeout` NOTE: This value can be overridden while defining a Cluster.Topology.
        /// </summary>
        public readonly string NodeDrainTimeout;
        /// <summary>
        /// NodeVolumeDetachTimeout is the total amount of time that the controller will spend on waiting for all volumes to be detached. The default value is 0, meaning that the volumes can be detached without any time limitations. NOTE: This value can be overridden while defining a Cluster.Topology.
        /// </summary>
        public readonly string NodeVolumeDetachTimeout;
        /// <summary>
        /// Ref is a required reference to a custom resource offered by a provider.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneRef Ref;

        [OutputConstructor]
        private ClusterClassSpecControlPlane(
            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMachineHealthCheck machineHealthCheck,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMachineInfrastructure machineInfrastructure,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneMetadata metadata,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneNamingStrategy namingStrategy,

            string nodeDeletionTimeout,

            string nodeDrainTimeout,

            string nodeVolumeDetachTimeout,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.ClusterClassSpecControlPlaneRef @ref)
        {
            MachineHealthCheck = machineHealthCheck;
            MachineInfrastructure = machineInfrastructure;
            Metadata = metadata;
            NamingStrategy = namingStrategy;
            NodeDeletionTimeout = nodeDeletionTimeout;
            NodeDrainTimeout = nodeDrainTimeout;
            NodeVolumeDetachTimeout = nodeVolumeDetachTimeout;
            Ref = @ref;
        }
    }
}
