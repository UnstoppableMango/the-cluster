// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.K8s.V1
{

    /// <summary>
    /// TransportServerStatus defines the status for the TransportServer resource.
    /// </summary>
    public class TransportServerStatusArgs : global::Pulumi.ResourceArgs
    {
        [Input("message")]
        public Input<string>? Message { get; set; }

        [Input("reason")]
        public Input<string>? Reason { get; set; }

        [Input("state")]
        public Input<string>? State { get; set; }

        public TransportServerStatusArgs()
        {
        }
        public static new TransportServerStatusArgs Empty => new TransportServerStatusArgs();
    }
}