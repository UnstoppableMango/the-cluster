// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha3
{

    /// <summary>
    /// MetalClusterSpec defines the desired state of MetalCluster.
    /// </summary>
    public class MetalClusterSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
        /// </summary>
        [Input("controlPlaneEndpoint")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha3.MetalClusterSpecControlPlaneEndpointArgs>? ControlPlaneEndpoint { get; set; }

        public MetalClusterSpecArgs()
        {
        }
        public static new MetalClusterSpecArgs Empty => new MetalClusterSpecArgs();
    }
}
