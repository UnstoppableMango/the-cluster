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
    /// Services indicates the configuration of Kubernetes Services needed for the topology of various forms of traffic (including ingress, e.t.c.) to and from the DataPlane.
    /// </summary>
    public class GatewayConfigurationSpecDataPlaneOptionsNetworkServicesArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Ingress is the Kubernetes Service that will be used to expose ingress traffic for the DataPlane. Here you can determine whether the DataPlane will be exposed outside the cluster (e.g. using a LoadBalancer type Services) or only internally (e.g. ClusterIP), and inject any additional annotations you need on the service (for instance, if you need to influence a cloud provider LoadBalancer configuration).
        /// </summary>
        [Input("ingress")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.GatewayConfigurationSpecDataPlaneOptionsNetworkServicesIngressArgs>? Ingress { get; set; }

        public GatewayConfigurationSpecDataPlaneOptionsNetworkServicesArgs()
        {
        }
        public static new GatewayConfigurationSpecDataPlaneOptionsNetworkServicesArgs Empty => new GatewayConfigurationSpecDataPlaneOptionsNetworkServicesArgs();
    }
}