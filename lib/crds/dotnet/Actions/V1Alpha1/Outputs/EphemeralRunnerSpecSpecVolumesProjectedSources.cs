// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1
{

    /// <summary>
    /// Projection that may be projected along with other supported volume types
    /// </summary>
    [OutputType]
    public sealed class EphemeralRunnerSpecSpecVolumesProjectedSources
    {
        /// <summary>
        /// configMap information about the configMap data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesConfigMap ConfigMap;
        /// <summary>
        /// downwardAPI information about the downwardAPI data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApi DownwardAPI;
        /// <summary>
        /// secret information about the secret data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesSecret Secret;
        /// <summary>
        /// serviceAccountToken is information about the serviceAccountToken data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesServiceAccountToken ServiceAccountToken;

        [OutputConstructor]
        private EphemeralRunnerSpecSpecVolumesProjectedSources(
            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesConfigMap configMap,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApi downwardAPI,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesSecret secret,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.EphemeralRunnerSpecSpecVolumesProjectedSourcesServiceAccountToken serviceAccountToken)
        {
            ConfigMap = configMap;
            DownwardAPI = downwardAPI;
            Secret = secret;
            ServiceAccountToken = serviceAccountToken;
        }
    }
}