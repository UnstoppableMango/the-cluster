// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4
{

    /// <summary>
    /// ControlPlane describes the cluster control plane.
    /// </summary>
    public class ClusterSpecTopologyControlPlaneArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Metadata is the metadata applied to the machines of the ControlPlane. At runtime this metadata is merged with the corresponding metadata from the ClusterClass. 
        ///  This field is supported if and only if the control plane provider template referenced in the ClusterClass is Machine based.
        /// </summary>
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterSpecTopologyControlPlaneMetadataArgs>? Metadata { get; set; }

        /// <summary>
        /// Replicas is the number of control plane nodes. If the value is nil, the ControlPlane object is created without the number of Replicas and it's assumed that the control plane controller does not implement support for this field. When specified against a control plane provider that lacks support for this field, this value will be ignored.
        /// </summary>
        [Input("replicas")]
        public Input<int>? Replicas { get; set; }

        public ClusterSpecTopologyControlPlaneArgs()
        {
        }
        public static new ClusterSpecTopologyControlPlaneArgs Empty => new ClusterSpecTopologyControlPlaneArgs();
    }
}
