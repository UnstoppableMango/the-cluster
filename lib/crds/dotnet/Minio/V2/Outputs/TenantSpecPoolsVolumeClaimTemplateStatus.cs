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
    public sealed class TenantSpecPoolsVolumeClaimTemplateStatus
    {
        public readonly ImmutableArray<string> AccessModes;
        public readonly ImmutableDictionary<string, string> AllocatedResourceStatuses;
        public readonly ImmutableDictionary<string, Union<int, string>> AllocatedResources;
        public readonly ImmutableDictionary<string, Union<int, string>> Capacity;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsVolumeClaimTemplateStatusConditions> Conditions;
        public readonly string Phase;

        [OutputConstructor]
        private TenantSpecPoolsVolumeClaimTemplateStatus(
            ImmutableArray<string> accessModes,

            ImmutableDictionary<string, string> allocatedResourceStatuses,

            ImmutableDictionary<string, Union<int, string>> allocatedResources,

            ImmutableDictionary<string, Union<int, string>> capacity,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPoolsVolumeClaimTemplateStatusConditions> conditions,

            string phase)
        {
            AccessModes = accessModes;
            AllocatedResourceStatuses = allocatedResourceStatuses;
            AllocatedResources = allocatedResources;
            Capacity = capacity;
            Conditions = conditions;
            Phase = phase;
        }
    }
}
