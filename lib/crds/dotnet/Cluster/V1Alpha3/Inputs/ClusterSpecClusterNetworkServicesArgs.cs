// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3
{

    /// <summary>
    /// The network ranges from which service VIPs are allocated.
    /// </summary>
    public class ClusterSpecClusterNetworkServicesArgs : global::Pulumi.ResourceArgs
    {
        [Input("cidrBlocks", required: true)]
        private InputList<string>? _cidrBlocks;
        public InputList<string> CidrBlocks
        {
            get => _cidrBlocks ?? (_cidrBlocks = new InputList<string>());
            set => _cidrBlocks = value;
        }

        public ClusterSpecClusterNetworkServicesArgs()
        {
        }
        public static new ClusterSpecClusterNetworkServicesArgs Empty => new ClusterSpecClusterNetworkServicesArgs();
    }
}