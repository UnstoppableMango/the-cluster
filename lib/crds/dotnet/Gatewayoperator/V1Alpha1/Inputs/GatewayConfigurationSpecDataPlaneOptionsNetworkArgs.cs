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
    /// DataPlaneNetworkOptions defines network related options for a DataPlane.
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsNetworkArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Services indicates the configuration of Kubernetes Services needed for the topology of various forms of traffic (including ingress, e.t.c.) to and from the DataPlane.
        /// </summary>
        [Input("services")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsNetworkServicesArgs>? Services { get; set; }

        public GatewayConfigurationSpecDataPlaneOptionsNetworkArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsNetworkArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsNetworkArgs();
    }
}