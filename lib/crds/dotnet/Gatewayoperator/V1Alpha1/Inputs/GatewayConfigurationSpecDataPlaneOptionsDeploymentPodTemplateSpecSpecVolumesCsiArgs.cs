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
    /// csi (Container Storage Interface) represents ephemeral storage that is handled by certain external CSI drivers (Beta feature).
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesCsiArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// driver is the name of the CSI driver that handles this volume. Consult with your admin for the correct name as registered in the cluster.
        /// </summary>
        [Input("driver", required: true)]
        public Input<string> Driver { get; set; } = null!;

        /// <summary>
        /// fsType to mount. Ex. "ext4", "xfs", "ntfs". If not provided, the empty value is passed to the associated CSI driver which will determine the default filesystem to apply.
        /// </summary>
        [Input("fsType")]
        public Input<string>? FsType { get; set; }

        /// <summary>
        /// nodePublishSecretRef is a reference to the secret object containing sensitive information to pass to the CSI driver to complete the CSI NodePublishVolume and NodeUnpublishVolume calls. This field is optional, and  may be empty if no secret is required. If the secret object contains more than one secret, all secret references are passed.
        /// </summary>
        [Input("nodePublishSecretRef")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesCsiNodePublishSecretRefArgs>? NodePublishSecretRef { get; set; }

        /// <summary>
        /// readOnly specifies a read-only configuration for the volume. Defaults to false (read/write).
        /// </summary>
        [Input("readOnly")]
        public Input<bool>? ReadOnly { get; set; }

        [Input("volumeAttributes")]
        private InputMap<string>? _volumeAttributes;

        /// <summary>
        /// volumeAttributes stores driver-specific properties that are passed to the CSI driver. Consult your driver's documentation for supported values.
        /// </summary>
        public InputMap<string> VolumeAttributes
        {
            get => _volumeAttributes ?? (_volumeAttributes = new InputMap<string>());
            set => _volumeAttributes = value;
        }

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesCsiArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesCsiArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesCsiArgs();
    }
}