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
    public sealed class TenantSpecPools
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsAffinity Affinity;
        public readonly ImmutableDictionary<string, string> Annotations;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContext ContainerSecurityContext;
        public readonly ImmutableDictionary<string, string> Labels;
        public readonly string Name;
        public readonly ImmutableDictionary<string, string> NodeSelector;
        public readonly bool ReclaimStorage;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsResources Resources;
        public readonly string RuntimeClassName;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsSecurityContext SecurityContext;
        public readonly int Servers;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsTolerations> Tolerations;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsTopologySpreadConstraints> TopologySpreadConstraints;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsVolumeClaimTemplate VolumeClaimTemplate;
        public readonly int VolumesPerServer;

        [OutputConstructor]
        private TenantSpecPools(
            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsAffinity affinity,

            ImmutableDictionary<string, string> annotations,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsContainerSecurityContext containerSecurityContext,

            ImmutableDictionary<string, string> labels,

            string name,

            ImmutableDictionary<string, string> nodeSelector,

            bool reclaimStorage,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsResources resources,

            string runtimeClassName,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsSecurityContext securityContext,

            int servers,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsTolerations> tolerations,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsTopologySpreadConstraints> topologySpreadConstraints,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsVolumeClaimTemplate volumeClaimTemplate,

            int volumesPerServer)
        {
            Affinity = affinity;
            Annotations = annotations;
            ContainerSecurityContext = containerSecurityContext;
            Labels = labels;
            Name = name;
            NodeSelector = nodeSelector;
            ReclaimStorage = reclaimStorage;
            Resources = resources;
            RuntimeClassName = runtimeClassName;
            SecurityContext = securityContext;
            Servers = servers;
            Tolerations = tolerations;
            TopologySpreadConstraints = topologySpreadConstraints;
            VolumeClaimTemplate = volumeClaimTemplate;
            VolumesPerServer = volumesPerServer;
        }
    }
}
