// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1
{

    /// <summary>
    /// VClusterStatus defines the observed state of VCluster
    /// </summary>
    public class VClusterStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1.VClusterStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions holds several conditions the vcluster might be in
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1.VClusterStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha1.VClusterStatusConditionsArgs>());
            set => _conditions = value;
        }

        /// <summary>
        /// Initialized defines if the virtual cluster control plane was initialized.
        /// </summary>
        [Input("initialized")]
        public Input<bool>? Initialized { get; set; }

        /// <summary>
        /// Message describes the reason in human readable form why the cluster is in the currrent phase
        /// </summary>
        [Input("message")]
        public Input<string>? Message { get; set; }

        /// <summary>
        /// ObservedGeneration is the latest generation observed by the controller.
        /// </summary>
        [Input("observedGeneration")]
        public Input<int>? ObservedGeneration { get; set; }

        /// <summary>
        /// Phase describes the current phase the virtual cluster is in
        /// </summary>
        [Input("phase")]
        public Input<string>? Phase { get; set; }

        /// <summary>
        /// Ready defines if the virtual cluster control plane is ready.
        /// </summary>
        [Input("ready")]
        public Input<bool>? Ready { get; set; }

        /// <summary>
        /// Reason describes the reason in machine readable form why the cluster is in the current phase
        /// </summary>
        [Input("reason")]
        public Input<string>? Reason { get; set; }

        public VClusterStatusArgs()
        {
        }
        public static new VClusterStatusArgs Empty => new VClusterStatusArgs();
    }
}
