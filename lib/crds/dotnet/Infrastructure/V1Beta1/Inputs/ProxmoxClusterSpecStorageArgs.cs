// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// storage is used for storing cloud init snippet
    /// </summary>
    public class ProxmoxClusterSpecStorageArgs : global::Pulumi.ResourceArgs
    {
        [Input("name")]
        public Input<string>? Name { get; set; }

        [Input("path")]
        public Input<string>? Path { get; set; }

        public ProxmoxClusterSpecStorageArgs()
        {
        }
        public static new ProxmoxClusterSpecStorageArgs Empty => new ProxmoxClusterSpecStorageArgs();
    }
}