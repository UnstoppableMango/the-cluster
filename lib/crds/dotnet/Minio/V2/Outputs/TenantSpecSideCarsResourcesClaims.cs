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
    public sealed class TenantSpecSideCarsResourcesClaims
    {
        public readonly string Name;

        [OutputConstructor]
        private TenantSpecSideCarsResourcesClaims(string name)
        {
            Name = name;
        }
    }
}
