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
    /// PodSchedulingGate is associated to a Pod to guard its scheduling.
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSpecSpecSchedulingGates
    {
        /// <summary>
        /// Name of the scheduling gate. Each scheduling gate must have a unique name field.
        /// </summary>
        public readonly string Name;

        [OutputConstructor]
        private EphemeralRunnerSpecSpecSchedulingGates(string name)
        {
            Name = name;
        }
    }
}