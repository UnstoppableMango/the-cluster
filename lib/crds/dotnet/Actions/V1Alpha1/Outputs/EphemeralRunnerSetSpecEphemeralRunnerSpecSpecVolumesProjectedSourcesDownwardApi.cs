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
    /// downwardAPI information about the downwardAPI data to project
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApi
    {
        /// <summary>
        /// Items is a list of DownwardAPIVolume file
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApiItems> Items;

        [OutputConstructor]
        private EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApi(ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApiItems> items)
        {
            Items = items;
        }
    }
}
