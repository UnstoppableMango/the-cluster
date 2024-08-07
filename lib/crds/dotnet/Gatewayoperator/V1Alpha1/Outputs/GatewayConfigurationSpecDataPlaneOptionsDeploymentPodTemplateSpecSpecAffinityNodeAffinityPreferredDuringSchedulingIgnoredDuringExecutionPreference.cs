// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// A node selector term, associated with the corresponding weight.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreference
    {
        /// <summary>
        /// A list of node selector requirements by node's labels.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressions> MatchExpressions;
        /// <summary>
        /// A list of node selector requirements by node's fields.
        /// </summary>
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFields> MatchFields;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreference(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressions> matchExpressions,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFields> matchFields)
        {
            MatchExpressions = matchExpressions;
            MatchFields = matchFields;
        }
    }
}
