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
    public sealed class TenantSpecKesEnvValueFrom
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromConfigMapKeyRef ConfigMapKeyRef;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromFieldRef FieldRef;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromResourceFieldRef ResourceFieldRef;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromSecretKeyRef SecretKeyRef;

        [OutputConstructor]
        private TenantSpecKesEnvValueFrom(
            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromConfigMapKeyRef configMapKeyRef,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromFieldRef fieldRef,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromResourceFieldRef resourceFieldRef,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKesEnvValueFromSecretKeyRef secretKeyRef)
        {
            ConfigMapKeyRef = configMapKeyRef;
            FieldRef = fieldRef;
            ResourceFieldRef = resourceFieldRef;
            SecretKeyRef = secretKeyRef;
        }
    }
}