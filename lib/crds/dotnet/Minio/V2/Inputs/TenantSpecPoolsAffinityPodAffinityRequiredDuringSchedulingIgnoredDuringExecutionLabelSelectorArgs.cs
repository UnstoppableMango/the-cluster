// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorArgs : global::Pulumi.ResourceArgs
    {
        [Input("matchExpressions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorMatchExpressionsArgs>? _matchExpressions;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorMatchExpressionsArgs> MatchExpressions
        {
            get => _matchExpressions ?? (_matchExpressions = new InputList<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorMatchExpressionsArgs>());
            set => _matchExpressions = value;
        }

        [Input("matchLabels")]
        private InputMap<string>? _matchLabels;
        public InputMap<string> MatchLabels
        {
            get => _matchLabels ?? (_matchLabels = new InputMap<string>());
            set => _matchLabels = value;
        }

        public TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorArgs()
        {
        }
        public static new TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorArgs Empty => new TenantSpecPoolsAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorArgs();
    }
}