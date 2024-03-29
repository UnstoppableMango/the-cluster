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
    public sealed class TenantSpecServiceMetadata
    {
        public readonly ImmutableDictionary<string, string> ConsoleServiceAnnotations;
        public readonly ImmutableDictionary<string, string> ConsoleServiceLabels;
        public readonly ImmutableDictionary<string, string> MinioServiceAnnotations;
        public readonly ImmutableDictionary<string, string> MinioServiceLabels;

        [OutputConstructor]
        private TenantSpecServiceMetadata(
            ImmutableDictionary<string, string> consoleServiceAnnotations,

            ImmutableDictionary<string, string> consoleServiceLabels,

            ImmutableDictionary<string, string> minioServiceAnnotations,

            ImmutableDictionary<string, string> minioServiceLabels)
        {
            ConsoleServiceAnnotations = consoleServiceAnnotations;
            ConsoleServiceLabels = consoleServiceLabels;
            MinioServiceAnnotations = minioServiceAnnotations;
            MinioServiceLabels = minioServiceLabels;
        }
    }
}
