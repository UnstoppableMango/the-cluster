// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha2
{

    /// <summary>
    /// MetalClusterStatus defines the observed state of MetalCluster.
    /// </summary>
    public class MetalClusterStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiEndpoints")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha2.MetalClusterStatusApiEndpointsArgs>? _apiEndpoints;

        /// <summary>
        /// APIEndpoints represents the endpoints to communicate with the control plane.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha2.MetalClusterStatusApiEndpointsArgs> ApiEndpoints
        {
            get => _apiEndpoints ?? (_apiEndpoints = new InputList<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Alpha2.MetalClusterStatusApiEndpointsArgs>());
            set => _apiEndpoints = value;
        }

        [Input("ready", required: true)]
        public Input<bool> Ready { get; set; } = null!;

        public MetalClusterStatusArgs()
        {
        }
        public static new MetalClusterStatusArgs Empty => new MetalClusterStatusArgs();
    }
}
