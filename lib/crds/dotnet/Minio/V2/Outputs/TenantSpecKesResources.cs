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
    public sealed class TenantSpecKesResources
    {
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesResourcesClaims> Claims;
        public readonly ImmutableDictionary<string, Union<int, string>> Limits;
        public readonly ImmutableDictionary<string, Union<int, string>> Requests;

        [OutputConstructor]
        private TenantSpecKesResources(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesResourcesClaims> claims,

            ImmutableDictionary<string, Union<int, string>> limits,

            ImmutableDictionary<string, Union<int, string>> requests)
        {
            Claims = claims;
            Limits = limits;
            Requests = requests;
        }
    }
}