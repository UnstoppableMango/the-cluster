// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4
{

    /// <summary>
    /// ClusterStatus defines the observed state of Cluster.
    /// </summary>
    public class ClusterStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions defines current service state of the cluster.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusConditionsArgs>());
            set => _conditions = value;
        }

        /// <summary>
        /// ControlPlaneReady defines if the control plane is ready.
        /// </summary>
        [Input("controlPlaneReady")]
        public Input<bool>? ControlPlaneReady { get; set; }

        [Input("failureDomains")]
        private InputMap<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusFailureDomainsArgs>? _failureDomains;

        /// <summary>
        /// FailureDomains is a slice of failure domain objects synced from the infrastructure provider.
        /// </summary>
        public InputMap<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusFailureDomainsArgs> FailureDomains
        {
            get => _failureDomains ?? (_failureDomains = new InputMap<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusFailureDomainsArgs>());
            set => _failureDomains = value;
        }

        /// <summary>
        /// FailureMessage indicates that there is a fatal problem reconciling the state, and will be set to a descriptive error message.
        /// </summary>
        [Input("failureMessage")]
        public Input<string>? FailureMessage { get; set; }

        /// <summary>
        /// FailureReason indicates that there is a fatal problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
        /// </summary>
        [Input("failureReason")]
        public Input<string>? FailureReason { get; set; }

        /// <summary>
        /// InfrastructureReady is the state of the infrastructure provider.
        /// </summary>
        [Input("infrastructureReady")]
        public Input<bool>? InfrastructureReady { get; set; }

        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        [Input("observedGeneration")]
        public Input<int>? ObservedGeneration { get; set; }

        /// <summary>
        /// Phase represents the current phase of cluster actuation. E.g. Pending, Running, Terminating, Failed etc.
        /// </summary>
        [Input("phase")]
        public Input<string>? Phase { get; set; }

        public ClusterStatusArgs()
        {
        }
        public static new ClusterStatusArgs Empty => new ClusterStatusArgs();
    }
}