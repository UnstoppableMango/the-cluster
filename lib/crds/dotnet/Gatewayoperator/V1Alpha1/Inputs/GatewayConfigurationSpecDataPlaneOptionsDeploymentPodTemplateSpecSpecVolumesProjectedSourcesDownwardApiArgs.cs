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
    /// downwardAPI information about the downwardAPI data to project
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiArgs : global::Pulumi.ResourceArgs
    {
        [Input("items")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiItemsArgs>? _items;

        /// <summary>
        /// Items is a list of DownwardAPIVolume file
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiItemsArgs> Items
        {
            get => _items ?? (_items = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiItemsArgs>());
            set => _items = value;
        }

        public GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecVolumesProjectedSourcesDownwardApiArgs();
    }
}