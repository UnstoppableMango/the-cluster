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
    public sealed class TenantSpecSideCarsVolumesConfigMap
    {
        public readonly int DefaultMode;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecSideCarsVolumesConfigMapItems> Items;
        public readonly string Name;
        public readonly bool Optional;

        [OutputConstructor]
        private TenantSpecSideCarsVolumesConfigMap(
            int defaultMode,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecSideCarsVolumesConfigMapItems> items,

            string name,

            bool optional)
        {
            DefaultMode = defaultMode;
            Items = items;
            Name = name;
            Optional = optional;
        }
    }
}