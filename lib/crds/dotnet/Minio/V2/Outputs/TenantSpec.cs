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
    public sealed class TenantSpec
    {
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumeMounts> AdditionalVolumeMounts;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumes> AdditionalVolumes;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecBuckets> Buckets;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecCertConfig CertConfig;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecConfiguration Configuration;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecCredsSecret CredsSecret;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecEnv> Env;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExposeServices ExposeServices;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalCaCertSecret> ExternalCaCertSecret;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalCertSecret> ExternalCertSecret;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalClientCertSecret ExternalClientCertSecret;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalClientCertSecrets> ExternalClientCertSecrets;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecFeatures Features;
        public readonly string Image;
        public readonly string ImagePullPolicy;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecImagePullSecret ImagePullSecret;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainers> InitContainers;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKes Kes;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLiveness Liveness;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLogging Logging;
        public readonly string MountPath;
        public readonly string PodManagementPolicy;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPools> Pools;
        public readonly string PriorityClassName;
        public readonly bool PrometheusOperator;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecReadiness Readiness;
        public readonly bool RequestAutoCert;
        public readonly string ServiceAccountName;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecServiceMetadata ServiceMetadata;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecSideCars SideCars;
        public readonly Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecStartup Startup;
        public readonly string SubPath;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecUsers> Users;

        [OutputConstructor]
        private TenantSpec(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumeMounts> additionalVolumeMounts,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecAdditionalVolumes> additionalVolumes,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecBuckets> buckets,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecCertConfig certConfig,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecConfiguration configuration,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecCredsSecret credsSecret,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecEnv> env,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExposeServices exposeServices,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalCaCertSecret> externalCaCertSecret,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalCertSecret> externalCertSecret,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalClientCertSecret externalClientCertSecret,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecExternalClientCertSecrets> externalClientCertSecrets,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecFeatures features,

            string image,

            string imagePullPolicy,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecImagePullSecret imagePullSecret,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecInitContainers> initContainers,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecKes kes,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLiveness liveness,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecLogging logging,

            string mountPath,

            string podManagementPolicy,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecPools> pools,

            string priorityClassName,

            bool prometheusOperator,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecReadiness readiness,

            bool requestAutoCert,

            string serviceAccountName,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecServiceMetadata serviceMetadata,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecSideCars sideCars,

            Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecStartup startup,

            string subPath,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Minio.V2.TenantSpecUsers> users)
        {
            AdditionalVolumeMounts = additionalVolumeMounts;
            AdditionalVolumes = additionalVolumes;
            Buckets = buckets;
            CertConfig = certConfig;
            Configuration = configuration;
            CredsSecret = credsSecret;
            Env = env;
            ExposeServices = exposeServices;
            ExternalCaCertSecret = externalCaCertSecret;
            ExternalCertSecret = externalCertSecret;
            ExternalClientCertSecret = externalClientCertSecret;
            ExternalClientCertSecrets = externalClientCertSecrets;
            Features = features;
            Image = image;
            ImagePullPolicy = imagePullPolicy;
            ImagePullSecret = imagePullSecret;
            InitContainers = initContainers;
            Kes = kes;
            Liveness = liveness;
            Logging = logging;
            MountPath = mountPath;
            PodManagementPolicy = podManagementPolicy;
            Pools = pools;
            PriorityClassName = priorityClassName;
            PrometheusOperator = prometheusOperator;
            Readiness = readiness;
            RequestAutoCert = requestAutoCert;
            ServiceAccountName = serviceAccountName;
            ServiceMetadata = serviceMetadata;
            SideCars = sideCars;
            Startup = startup;
            SubPath = subPath;
            Users = users;
        }
    }
}
