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
    /// A node selector term, associated with the corresponding weight.
    /// </summary>
    public class AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs : global::Pulumi.ResourceArgs
    {
        [Input("matchExpressions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs>? _matchExpressions;

        /// <summary>
        /// A list of node selector requirements by node's labels.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs> MatchExpressions
        {
            get => _matchExpressions ?? (_matchExpressions = new InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchExpressionsArgs>());
            set => _matchExpressions = value;
        }

        [Input("matchFields")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs>? _matchFields;

        /// <summary>
        /// A list of node selector requirements by node's fields.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs> MatchFields
        {
            get => _matchFields ?? (_matchFields = new InputList<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceMatchFieldsArgs>());
            set => _matchFields = value;
        }

        public AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs()
        {
        }
        public static new AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs Empty => new AutoscalingListenerSpecTemplateSpecAffinityNodeAffinityPreferredDuringSchedulingIgnoredDuringExecutionPreferenceArgs();
    }
}