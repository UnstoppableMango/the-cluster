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
    /// ClusterStatus defines the observed state of Cluster.
    /// </summary>
    [OutputType]
    public sealed class ClusterStatus
    {
        /// <summary>
        /// Conditions defines current service state of the cluster.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterStatusConditions> Conditions;
        /// <summary>
        /// ControlPlaneReady defines if the control plane is ready.
        /// </summary>
        public readonly bool ControlPlaneReady;
        /// <summary>
        /// FailureDomains is a slice of failure domain objects synced from the infrastructure provider.
        /// </summary>
        public readonly ImmutableDictionary<string, Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterStatusFailureDomains> FailureDomains;
        /// <summary>
        /// FailureMessage indicates that there is a fatal problem reconciling the state, and will be set to a descriptive error message.
        /// </summary>
        public readonly string FailureMessage;
        /// <summary>
        /// FailureReason indicates that there is a fatal problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
        /// </summary>
        public readonly string FailureReason;
        /// <summary>
        /// InfrastructureReady is the state of the infrastructure provider.
        /// </summary>
        public readonly bool InfrastructureReady;
        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        public readonly int ObservedGeneration;
        /// <summary>
        /// Phase represents the current phase of cluster actuation. E.g. Pending, Running, Terminating, Failed etc.
        /// </summary>
        public readonly string Phase;

        [OutputConstructor]
        private ClusterStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterStatusConditions> conditions,

            bool controlPlaneReady,

            ImmutableDictionary<string, Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterStatusFailureDomains> failureDomains,

            string failureMessage,

            string failureReason,

            bool infrastructureReady,

            int observedGeneration,

            string phase)
        {
            Conditions = conditions;
            ControlPlaneReady = controlPlaneReady;
            FailureDomains = failureDomains;
            FailureMessage = failureMessage;
            FailureReason = failureReason;
            InfrastructureReady = infrastructureReady;
            ObservedGeneration = observedGeneration;
            Phase = phase;
        }
    }
}
