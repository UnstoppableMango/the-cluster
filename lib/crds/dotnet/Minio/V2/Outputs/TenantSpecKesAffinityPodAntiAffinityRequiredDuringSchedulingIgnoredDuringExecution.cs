// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Minio.V2
{

    [OutputType]
    public sealed class TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecution
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelector LabelSelector;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecutionNamespaceSelector NamespaceSelector;
        public readonly ImmutableArray<string> Namespaces;
        public readonly string TopologyKey;

        [OutputConstructor]
        private TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecution(
            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecutionLabelSelector labelSelector,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesAffinityPodAntiAffinityRequiredDuringSchedulingIgnoredDuringExecutionNamespaceSelector namespaceSelector,

            ImmutableArray<string> namespaces,

            string topologyKey)
        {
            LabelSelector = labelSelector;
            NamespaceSelector = namespaceSelector;
            Namespaces = namespaces;
            TopologyKey = topologyKey;
        }
    }
}