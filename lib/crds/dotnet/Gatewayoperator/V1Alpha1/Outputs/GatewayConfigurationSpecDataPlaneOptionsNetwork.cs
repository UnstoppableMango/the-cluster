// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// DataPlaneNetworkOptions defines network related options for a DataPlane.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsNetwork
    {
        /// <summary>
        /// Services indicates the configuration of Kubernetes Services needed for the topology of various forms of traffic (including ingress, e.t.c.) to and from the DataPlane.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsNetworkServices Services;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsNetwork(Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsNetworkServices services)
        {
            Services = services;
        }
    }
}
