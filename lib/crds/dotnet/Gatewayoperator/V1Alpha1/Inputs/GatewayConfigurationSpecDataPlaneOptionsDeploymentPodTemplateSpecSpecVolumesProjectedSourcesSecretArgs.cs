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
    /// secret information about the secret data to project
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretArgs : global::Pulumi.ResourceArgs
    {
        [Input("items")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretItemsArgs>? _items;

        /// <summary>
        /// items if unspecified, each key-value pair in the Data field of the referenced Secret will be projected into the volume as a file whose name is the key and content is the value. If specified, the listed keys will be projected into the specified paths, and unlisted keys will not be present. If a key is specified which is not present in the Secret, the volume setup will error unless it is marked optional. Paths must be relative and may not contain the '..' path or start with '..'.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretItemsArgs> Items
        {
            get => _items ?? (_items = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretItemsArgs>());
            set => _items = value;
        }

        /// <summary>
        /// Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        /// <summary>
        /// optional field specify whether the Secret or its key must be defined
        /// </summary>
        [Input("optional")]
        public Input<bool>? Optional { get; set; }

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesSecretArgs();
    }
}