// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1
{

    /// <summary>
    /// EphemeralRunnerSetStatus defines the observed state of EphemeralRunnerSet
    /// </summary>
    public class EphemeralRunnerSetStatusArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// CurrentReplicas is the number of currently running EphemeralRunner resources being managed by this EphemeralRunnerSet.
        /// </summary>
        [Input("currentReplicas", required: true)]
        public Input<int> CurrentReplicas { get; set; } = null!;

        [Input("failedEphemeralRunners")]
        public Input<int>? FailedEphemeralRunners { get; set; }

        [Input("pendingEphemeralRunners")]
        public Input<int>? PendingEphemeralRunners { get; set; }

        [Input("runningEphemeralRunners")]
        public Input<int>? RunningEphemeralRunners { get; set; }

        public EphemeralRunnerSetStatusArgs()
        {
        }
        public static new EphemeralRunnerSetStatusArgs Empty => new EphemeralRunnerSetStatusArgs();
    }
}
