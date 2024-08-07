// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1
{

    /// <summary>
    /// Cluster network configuration.
    /// </summary>
    public class ClusterSpecClusterNetworkArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// APIServerPort specifies the port the API Server should bind to. Defaults to 6443.
        /// </summary>
        [Input("apiServerPort")]
        public Input<int>? ApiServerPort { get; set; }

        /// <summary>
        /// The network ranges from which Pod networks are allocated.
        /// </summary>
        [Input("pods")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterSpecClusterNetworkPodsArgs>? Pods { get; set; }

        /// <summary>
        /// Domain name for services.
        /// </summary>
        [Input("serviceDomain")]
        public Input<string>? ServiceDomain { get; set; }

        /// <summary>
        /// The network ranges from which service VIPs are allocated.
        /// </summary>
        [Input("services")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterSpecClusterNetworkServicesArgs>? Services { get; set; }

        public ClusterSpecClusterNetworkArgs()
        {
        }
        public static new ClusterSpecClusterNetworkArgs Empty => new ClusterSpecClusterNetworkArgs();
    }
}
