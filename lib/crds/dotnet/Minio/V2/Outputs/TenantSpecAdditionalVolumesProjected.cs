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
    public sealed class TenantSpecAdditionalVolumesProjected
    {
        public readonly int DefaultMode;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumesProjectedSources> Sources;

        [OutputConstructor]
        private TenantSpecAdditionalVolumesProjected(
            int defaultMode,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumesProjectedSources> sources)
        {
            DefaultMode = defaultMode;
            Sources = sources;
        }
    }
}
