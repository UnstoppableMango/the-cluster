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
    /// GatewayConfigurationSpec defines the desired state of GatewayConfiguration
    /// </summary>
    public class GatewayConfigurationSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// ControlPlaneOptions is the specification for configuration overrides for ControlPlane resources that will be created for the Gateway.
        /// </summary>
        [Input("controlPlaneOptions")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecControlPlaneOptionsArgs>? ControlPlaneOptions { get; set; }

        /// <summary>
        /// DataPlaneOptions is the specification for configuration overrides for DataPlane resources that will be created for the Gateway.
        /// </summary>
        [Input("dataPlaneOptions")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsArgs>? DataPlaneOptions { get; set; }

        public GatewayConfigurationSpecArgs()
        {
        }
        public static new GatewayConfigurationSpecArgs Empty => new GatewayConfigurationSpecArgs();
    }
}