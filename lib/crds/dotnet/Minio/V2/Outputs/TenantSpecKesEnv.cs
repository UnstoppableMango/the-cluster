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
    public sealed class TenantSpecKesEnv
    {
        public readonly string Name;
        public readonly string Value;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFrom ValueFrom;

        [OutputConstructor]
        private TenantSpecKesEnv(
            string name,

            string value,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFrom valueFrom)
        {
            Name = name;
            Value = value;
            ValueFrom = valueFrom;
        }
    }
}