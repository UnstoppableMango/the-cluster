// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1
{

    /// <summary>
    /// Existing tunnel object. ExistingTunnel and NewTunnel cannot be both empty and are mutually exclusive.
    /// </summary>
    public class ClusterTunnelSpecExistingTunnelArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Existing Tunnel ID to run on. Tunnel ID and Tunnel Name cannot be both empty. If both are provided, ID is used if valid, else falls back to Name.
        /// </summary>
        [Input("id")]
        public Input<string>? Id { get; set; }

        /// <summary>
        /// Existing Tunnel name to run on. Tunnel Name and Tunnel ID cannot be both empty. If both are provided, ID is used if valid, else falls back to Name.
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        public ClusterTunnelSpecExistingTunnelArgs()
        {
        }
        public static new ClusterTunnelSpecExistingTunnelArgs Empty => new ClusterTunnelSpecExistingTunnelArgs();
    }
}
