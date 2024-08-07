// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1
{

    /// <summary>
    /// PoolRef is a reference to the pool from which an IP address should be created.
    /// </summary>
    public class IPAddressClaimSpecPoolRefArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// APIGroup is the group for the resource being referenced. If APIGroup is not specified, the specified Kind must be in the core API group. For any other third-party types, APIGroup is required.
        /// </summary>
        [Input("apiGroup")]
        public Input<string>? ApiGroup { get; set; }

        /// <summary>
        /// Kind is the type of resource being referenced
        /// </summary>
        [Input("kind", required: true)]
        public Input<string> Kind { get; set; } = null!;

        /// <summary>
        /// Name is the name of resource being referenced
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        public IPAddressClaimSpecPoolRefArgs()
        {
        }
        public static new IPAddressClaimSpecPoolRefArgs Empty => new IPAddressClaimSpecPoolRefArgs();
    }
}
