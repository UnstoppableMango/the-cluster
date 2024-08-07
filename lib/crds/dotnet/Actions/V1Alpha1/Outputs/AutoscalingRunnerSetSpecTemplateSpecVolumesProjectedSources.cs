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
    public sealed class AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSources
    {
        /// <summary>
        /// configMap information about the configMap data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesConfigMap ConfigMap;
        /// <summary>
        /// downwardAPI information about the downwardAPI data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesDownwardApi DownwardAPI;
        /// <summary>
        /// secret information about the secret data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesSecret Secret;
        /// <summary>
        /// serviceAccountToken is information about the serviceAccountToken data to project
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesServiceAccountToken ServiceAccountToken;

        [OutputConstructor]
        private AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSources(
            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesConfigMap configMap,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesDownwardApi downwardAPI,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesSecret secret,

            Pulumi.Kubernetes.Types.Outputs.Actions.V1Alpha1.AutoscalingRunnerSetSpecTemplateSpecVolumesProjectedSourcesServiceAccountToken serviceAccountToken)
        {
            ConfigMap = configMap;
            DownwardAPI = downwardAPI;
            Secret = secret;
            ServiceAccountToken = serviceAccountToken;
        }
    }
}
