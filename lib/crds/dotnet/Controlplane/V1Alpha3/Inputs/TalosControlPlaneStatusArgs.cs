// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Controlplane.V1Alpha3
{

    /// <summary>
    /// TalosControlPlaneStatus defines the observed state of TalosControlPlane
    /// </summary>
    public class TalosControlPlaneStatusArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Bootstrapped denotes whether any nodes received bootstrap request which is required to start etcd and Kubernetes components in Talos.
        /// </summary>
        [Input("bootstrapped")]
        public Input<bool>? Bootstrapped { get; set; }

        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Controlplane.V1Alpha3.TalosControlPlaneStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions defines current service state of the KubeadmControlPlane.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Controlplane.V1Alpha3.TalosControlPlaneStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Controlplane.V1Alpha3.TalosControlPlaneStatusConditionsArgs>());
            set => _conditions = value;
        }

        /// <summary>
        /// ErrorMessage indicates that there is a terminal problem reconciling the state, and will be set to a descriptive error message.
        /// </summary>
        [Input("failureMessage")]
        public Input<string>? FailureMessage { get; set; }

        /// <summary>
        /// FailureReason indicates that there is a terminal problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
        /// </summary>
        [Input("failureReason")]
        public Input<string>? FailureReason { get; set; }

        /// <summary>
        /// Initialized denotes whether or not the control plane has the uploaded talos-config configmap.
        /// </summary>
        [Input("initialized")]
        public Input<bool>? Initialized { get; set; }

        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        [Input("observedGeneration")]
        public Input<int>? ObservedGeneration { get; set; }

        /// <summary>
        /// Ready denotes that the TalosControlPlane API Server is ready to receive requests.
        /// </summary>
        [Input("ready")]
        public Input<bool>? Ready { get; set; }

        /// <summary>
        /// Total number of fully running and ready control plane machines.
        /// </summary>
        [Input("readyReplicas")]
        public Input<int>? ReadyReplicas { get; set; }

        /// <summary>
        /// Total number of non-terminated machines targeted by this control plane (their labels match the selector).
        /// </summary>
        [Input("replicas")]
        public Input<int>? Replicas { get; set; }

        /// <summary>
        /// Selector is the label selector in string format to avoid introspection by clients, and is used to provide the CRD-based integration for the scale subresource and additional integrations for things like kubectl describe.. The string will be in the same format as the query-param syntax. More info about label selectors: http://kubernetes.io/docs/user-guide/labels#label-selectors
        /// </summary>
        [Input("selector")]
        public Input<string>? Selector { get; set; }

        /// <summary>
        /// Total number of unavailable machines targeted by this control plane. This is the total number of machines that are still required for the deployment to have 100% available capacity. They may either be machines that are running but not yet ready or machines that still have not been created.
        /// </summary>
        [Input("unavailableReplicas")]
        public Input<int>? UnavailableReplicas { get; set; }

        public TalosControlPlaneStatusArgs()
        {
        }
        public static new TalosControlPlaneStatusArgs Empty => new TalosControlPlaneStatusArgs();
    }
}
