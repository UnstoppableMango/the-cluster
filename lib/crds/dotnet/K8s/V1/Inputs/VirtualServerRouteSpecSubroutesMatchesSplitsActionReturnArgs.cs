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
    /// ActionReturn defines a return in an Action.
    /// </summary>
    public class VirtualServerRouteSpecSubroutesMatchesSplitsActionReturnArgs : global::Pulumi.ResourceArgs
    {
        [Input("body")]
        public Input<string>? Body { get; set; }

        [Input("code")]
        public Input<int>? Code { get; set; }

        [Input("type")]
        public Input<string>? Type { get; set; }

        public VirtualServerRouteSpecSubroutesMatchesSplitsActionReturnArgs()
        {
        }
        public static new VirtualServerRouteSpecSubroutesMatchesSplitsActionReturnArgs Empty => new VirtualServerRouteSpecSubroutesMatchesSplitsActionReturnArgs();
    }
}
