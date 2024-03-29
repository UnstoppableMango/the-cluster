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
    /// EphemeralRunnerSetSpec defines the desired state of EphemeralRunnerSet
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSetSpec
    {
        /// <summary>
        /// EphemeralRunnerSpec defines the desired state of EphemeralRunner
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpec EphemeralRunnerSpec;
        /// <summary>
        /// Replicas is the number of desired EphemeralRunner resources in the k8s namespace.
        /// </summary>
        public readonly int Replicas;

        [OutputConstructor]
        private EphemeralRunnerSetSpec(
            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpec ephemeralRunnerSpec,

            int replicas)
        {
            EphemeralRunnerSpec = ephemeralRunnerSpec;
            Replicas = replicas;
        }
    }
}
