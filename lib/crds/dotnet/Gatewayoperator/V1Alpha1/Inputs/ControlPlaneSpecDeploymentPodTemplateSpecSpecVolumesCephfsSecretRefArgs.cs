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
    /// secretRef is Optional: SecretRef is reference to the authentication secret for User, default is empty. More info: https://examples.k8s.io/volumes/cephfs/README.md#how-to-use-it
    /// </summary>
    public class ControlPlaneSpecDeploymentPodTemplateSpecSpecVolumesCephfsSecretRefArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        public ControlPlaneSpecDeploymentPodTemplateSpecSpecVolumesCephfsSecretRefArgs()
        {
        }
        public static new ControlPlaneSpecDeploymentPodTemplateSpecSpecVolumesCephfsSecretRefArgs Empty => new ControlPlaneSpecDeploymentPodTemplateSpecSpecVolumesCephfsSecretRefArgs();
    }
}