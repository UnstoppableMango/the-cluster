// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1
{

    /// <summary>
    /// AutoscalingRunnerSetStatus defines the observed state of AutoscalingRunnerSet
    /// </summary>
    [OutputType]
    public sealed class AutoscalingRunnerSetStatus
    {
        public readonly int CurrentRunners;
        public readonly int FailedEphemeralRunners;
        public readonly int PendingEphemeralRunners;
        public readonly int RunningEphemeralRunners;
        public readonly string State;

        [OutputConstructor]
        private AutoscalingRunnerSetStatus(
            int currentRunners,

            int failedEphemeralRunners,

            int pendingEphemeralRunners,

            int runningEphemeralRunners,

            string state)
        {
            CurrentRunners = currentRunners;
            FailedEphemeralRunners = failedEphemeralRunners;
            PendingEphemeralRunners = pendingEphemeralRunners;
            RunningEphemeralRunners = runningEphemeralRunners;
            State = state;
        }
    }
}