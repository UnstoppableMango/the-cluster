// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1
{

    /// <summary>
    /// Projection that may be projected along with other supported volume types
    /// </summary>
    public class EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// configMap information about the configMap data to project
        /// </summary>
        [Input("configMap")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesConfigMapArgs>? ConfigMap { get; set; }

        /// <summary>
        /// downwardAPI information about the downwardAPI data to project
        /// </summary>
        [Input("downwardAPI")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesDownwardApiArgs>? DownwardAPI { get; set; }

        /// <summary>
        /// secret information about the secret data to project
        /// </summary>
        [Input("secret")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesSecretArgs>? Secret { get; set; }

        /// <summary>
        /// serviceAccountToken is information about the serviceAccountToken data to project
        /// </summary>
        [Input("serviceAccountToken")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Actions.V1Alpha1.EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesServiceAccountTokenArgs>? ServiceAccountToken { get; set; }

        public EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesArgs()
        {
        }
        public static new EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesArgs Empty => new EphemeralRunnerSetSpecEphemeralRunnerSpecSpecVolumesProjectedSourcesArgs();
    }
}