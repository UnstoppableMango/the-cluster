// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// The weights of all of the matched WeightedPodAffinityTerm fields are added per-node to find the most preferred node(s)
    /// </summary>
    public class DataPlaneSpecDeploymentPodTemplateSpecSpecAffinityPodAntiAffinityPreferredDuringSchedulingIgnoredDuringExecutionArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Required. A pod affinity term, associated with the corresponding weight.
        /// </summary>
        [Input("podAffinityTerm", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecAffinityPodAntiAffinityPreferredDuringSchedulingIgnoredDuringExecutionPodAffinityTermArgs> PodAffinityTerm { get; set; } = null!;

        /// <summary>
        /// weight associated with matching the corresponding podAffinityTerm, in the range 1-100.
        /// </summary>
        [Input("weight", required: true)]
        public Input<int> Weight { get; set; } = null!;

        public DataPlaneSpecDeploymentPodTemplateSpecSpecAffinityPodAntiAffinityPreferredDuringSchedulingIgnoredDuringExecutionArgs()
        {
        }
        public static new DataPlaneSpecDeploymentPodTemplateSpecSpecAffinityPodAntiAffinityPreferredDuringSchedulingIgnoredDuringExecutionArgs Empty => new DataPlaneSpecDeploymentPodTemplateSpecSpecAffinityPodAntiAffinityPreferredDuringSchedulingIgnoredDuringExecutionArgs();
    }
}
