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
    /// MachineStatus defines the observed state of Machine.
    /// </summary>
    [OutputType]
    public sealed class MachineStatus
    {
        /// <summary>
        /// Addresses is a list of addresses assigned to the machine. This field is copied from the infrastructure provider reference.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusAddresses> Addresses;
        /// <summary>
        /// BootstrapReady is the state of the bootstrap provider.
        /// </summary>
        public readonly bool BootstrapReady;
        /// <summary>
        /// CertificatesExpiryDate is the expiry date of the machine certificates. This value is only set for control plane machines.
        /// </summary>
        public readonly string CertificatesExpiryDate;
        /// <summary>
        /// Conditions defines current service state of the Machine.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusConditions> Conditions;
        /// <summary>
        /// FailureMessage will be set in the event that there is a terminal problem reconciling the Machine and will contain a more verbose string suitable for logging and human consumption. 
        ///  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured. 
        ///  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
        /// </summary>
        public readonly string FailureMessage;
        /// <summary>
        /// FailureReason will be set in the event that there is a terminal problem reconciling the Machine and will contain a succinct value suitable for machine interpretation. 
        ///  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured. 
        ///  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
        /// </summary>
        public readonly string FailureReason;
        /// <summary>
        /// InfrastructureReady is the state of the infrastructure provider.
        /// </summary>
        public readonly bool InfrastructureReady;
        /// <summary>
        /// LastUpdated identifies when the phase of the Machine last transitioned.
        /// </summary>
        public readonly string LastUpdated;
        /// <summary>
        /// NodeInfo is a set of ids/uuids to uniquely identify the node. More info: https://kubernetes.io/docs/concepts/nodes/node/#info
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusNodeInfo NodeInfo;
        /// <summary>
        /// NodeRef will point to the corresponding Node if it exists.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusNodeRef NodeRef;
        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        public readonly int ObservedGeneration;
        /// <summary>
        /// Phase represents the current phase of machine actuation. E.g. Pending, Running, Terminating, Failed etc.
        /// </summary>
        public readonly string Phase;

        [OutputConstructor]
        private MachineStatus(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusAddresses> addresses,

            bool bootstrapReady,

            string certificatesExpiryDate,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusConditions> conditions,

            string failureMessage,

            string failureReason,

            bool infrastructureReady,

            string lastUpdated,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusNodeInfo nodeInfo,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1.MachineStatusNodeRef nodeRef,

            int observedGeneration,

            string phase)
        {
            Addresses = addresses;
            BootstrapReady = bootstrapReady;
            CertificatesExpiryDate = certificatesExpiryDate;
            Conditions = conditions;
            FailureMessage = failureMessage;
            FailureReason = failureReason;
            InfrastructureReady = infrastructureReady;
            LastUpdated = lastUpdated;
            NodeInfo = nodeInfo;
            NodeRef = nodeRef;
            ObservedGeneration = observedGeneration;
            Phase = phase;
        }
    }
}