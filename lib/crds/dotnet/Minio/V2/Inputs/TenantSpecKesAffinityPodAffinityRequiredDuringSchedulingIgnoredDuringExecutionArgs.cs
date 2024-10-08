// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Minio.V2
{

    public class TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionArgs : global::Pulumi.ResourceArgs
    {
        [Input("labelSelector")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelectorArgs>? LabelSelector { get; set; }

        [Input("namespaceSelector")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Minio.V2.TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionNamespaceSelectorArgs>? NamespaceSelector { get; set; }

        [Input("namespaces")]
        private InputList<string>? _namespaces;
        public InputList<string> Namespaces
        {
            get => _namespaces ?? (_namespaces = new InputList<string>());
            set => _namespaces = value;
        }

        [Input("topologyKey", required: true)]
        public Input<string> TopologyKey { get; set; } = null!;

        public TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionArgs()
        {
        }
        public static new TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionArgs Empty => new TenantSpecKesAffinityPodAffinityRequiredDuringSchedulingIgnoredDuringExecutionArgs();
    }
}
