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
    /// MachinePoolStatus defines the observed state of MachinePool.
    /// </summary>
    [OutputType]
    public sealed class MachinePoolStatus
    {
        /// <summary>
        /// The number of available replicas (ready for at least minReadySeconds) for this MachinePool.
        /// </summary>
        public readonly int AvailableReplicas;
        /// <summary>
        /// BootstrapReady is the state of the bootstrap provider.
        /// </summary>
        public readonly bool BootstrapReady;
        /// <summary>
        /// Conditions define the current service state of the MachinePool.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolStatusConditions> Conditions;
        /// <summary>
        /// FailureMessage indicates that there is a problem reconciling the state, and will be set to a descriptive error message.
        /// </summary>
        public readonly string FailureMessage;
        /// <summary>
        /// FailureReason indicates that there is a problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
        /// </summary>
        public readonly string FailureReason;
        /// <summary>
        /// InfrastructureReady is the state of the infrastructure provider.
        /// </summary>
        public readonly bool InfrastructureReady;
        /// <summary>
        /// NodeRefs will point to the corresponding Nodes if it they exist.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolStatusNodeRefs> NodeRefs;
        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        public readonly int ObservedGeneration;
        /// <summary>
        /// Phase represents the current phase of cluster actuation. E.g. Pending, Running, Terminating, Failed etc.
        /// </summary>
        public readonly string Phase;
        /// <summary>
        /// The number of ready replicas for this MachinePool. A machine is considered ready when the node has been created and is "Ready".
        /// </summary>
        public readonly int ReadyReplicas;
        /// <summary>
        /// Replicas is the most recently observed number of replicas.
        /// </summary>
        public readonly int Replicas;
        /// <summary>
        /// Total number of unavailable machine instances targeted by this machine pool. This is the total number of machine instances that are still required for the machine pool to have 100% available capacity. They may either be machine instances that are running but not yet available or machine instances that still have not been created.
        /// </summary>
        public readonly int UnavailableReplicas;

        [OutputConstructor]
        private MachinePoolStatus(
            int availableReplicas,

            bool bootstrapReady,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolStatusConditions> conditions,

            string failureMessage,

            string failureReason,

            bool infrastructureReady,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolStatusNodeRefs> nodeRefs,

            int observedGeneration,

            string phase,

            int readyReplicas,

            int replicas,

            int unavailableReplicas)
        {
            AvailableReplicas = availableReplicas;
            BootstrapReady = bootstrapReady;
            Conditions = conditions;
            FailureMessage = failureMessage;
            FailureReason = failureReason;
            InfrastructureReady = infrastructureReady;
            NodeRefs = nodeRefs;
            ObservedGeneration = observedGeneration;
            Phase = phase;
            ReadyReplicas = readyReplicas;
            Replicas = replicas;
            UnavailableReplicas = unavailableReplicas;
        }
    }
}
