// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// downwardAPI information about the downwardAPI data to project
    /// </summary>
    [OutputType]
    public sealed class DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApi
    {
        /// <summary>
        /// Items is a list of DownwardAPIVolume file
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiItems> Items;

        [OutputConstructor]
        private DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApi(ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiItems> items)
        {
            Items = items;
        }
    }
}
