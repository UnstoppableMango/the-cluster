// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1
{

    /// <summary>
    /// MachineSetStatus defines the observed state of MachineSet.
    /// </summary>
    public class MachineSetStatusArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// The number of available replicas (ready for at least minReadySeconds) for this MachineSet.
        /// </summary>
        [Input("availableReplicas")]
        public Input<int>? AvailableReplicas { get; set; }

        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.MachineSetStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions defines current service state of the MachineSet.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.MachineSetStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.MachineSetStatusConditionsArgs>());
            set => _conditions = value;
        }

        [Input("failureMessage")]
        public Input<string>? FailureMessage { get; set; }

        /// <summary>
        /// In the event that there is a terminal problem reconciling the replicas, both FailureReason and FailureMessage will be set. FailureReason will be populated with a succinct value suitable for machine interpretation, while FailureMessage will contain a more verbose string suitable for logging and human consumption. 
        ///  These fields should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the MachineTemplate's spec or the configuration of the machine controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the machine controller, or the responsible machine controller itself being critically misconfigured. 
        ///  Any transient errors that occur during the reconciliation of Machines can be added as events to the MachineSet object and/or logged in the controller's output.
        /// </summary>
        [Input("failureReason")]
        public Input<string>? FailureReason { get; set; }

        /// <summary>
        /// The number of replicas that have labels matching the labels of the machine template of the MachineSet.
        /// </summary>
        [Input("fullyLabeledReplicas")]
        public Input<int>? FullyLabeledReplicas { get; set; }

        /// <summary>
        /// ObservedGeneration reflects the generation of the most recently observed MachineSet.
        /// </summary>
        [Input("observedGeneration")]
        public Input<int>? ObservedGeneration { get; set; }

        /// <summary>
        /// The number of ready replicas for this MachineSet. A machine is considered ready when the node has been created and is "Ready".
        /// </summary>
        [Input("readyReplicas")]
        public Input<int>? ReadyReplicas { get; set; }

        /// <summary>
        /// Replicas is the most recently observed number of replicas.
        /// </summary>
        [Input("replicas")]
        public Input<int>? Replicas { get; set; }

        /// <summary>
        /// Selector is the same as the label selector but in the string format to avoid introspection by clients. The string will be in the same format as the query-param syntax. More info about label selectors: http://kubernetes.io/docs/user-guide/labels#label-selectors
        /// </summary>
        [Input("selector")]
        public Input<string>? Selector { get; set; }

        public MachineSetStatusArgs()
        {
        }
        public static new MachineSetStatusArgs Empty => new MachineSetStatusArgs();
    }
}
