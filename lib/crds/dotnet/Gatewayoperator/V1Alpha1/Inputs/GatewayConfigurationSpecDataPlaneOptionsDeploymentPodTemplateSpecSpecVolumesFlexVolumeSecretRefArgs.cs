// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// secretRef is Optional: secretRef is reference to the secret object containing sensitive information to pass to the plugin scripts. This may be empty if no secret object is specified. If the secret object contains more than one secret, all secrets are passed to the plugin scripts.
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesFlexVolumeSecretRefArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesFlexVolumeSecretRefArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesFlexVolumeSecretRefArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesFlexVolumeSecretRefArgs();
    }
}