// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.K8s.V1Alpha1
{

    /// <summary>
    /// TransportServerAction defines an action.
    /// </summary>
    public class TransportServerSpecActionArgs : global::Pulumi.ResourceArgs
    {
        [Input("pass")]
        public Input<string>? Pass { get; set; }

        public TransportServerSpecActionArgs()
        {
        }
        public static new TransportServerSpecActionArgs Empty => new TransportServerSpecActionArgs();
    }
}
