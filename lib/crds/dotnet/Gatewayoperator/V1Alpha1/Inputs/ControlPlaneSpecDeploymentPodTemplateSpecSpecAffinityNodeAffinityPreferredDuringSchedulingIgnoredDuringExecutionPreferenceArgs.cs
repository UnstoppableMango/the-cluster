// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// A node selector term, associated with the corresponding weight.
    /// </summary>
    public class ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs : global::Pulumi.ResourceArgs
    {
        [Input("matchExpressions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs>? _matchExpressions;

        /// <summary>
        /// A list of node selector requirements by node's labels.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs> MatchExpressions
        {
            get => _matchExpressions ?? (_matchExpressions = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs>());
            set => _matchExpressions = value;
        }

        [Input("matchFields")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs>? _matchFields;

        /// <summary>
        /// A list of node selector requirements by node's fields.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs> MatchFields
        {
            get => _matchFields ?? (_matchFields = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs>());
            set => _matchFields = value;
        }

        public ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs()
        {
        }
        public static new ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs Empty => new ControlPlaneSpecDeploymentPodTemplateSpecSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs();
    }
}
