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
    /// Action defines an action.
    /// </summary>
    public class VirtualServerSpecRoutesSplitsActionArgs : global::Pulumi.ResourceArgs
    {
        [Input("pass")]
        public Input<string>? Pass { get; set; }

        /// <summary>
        /// ActionProxy defines a proxy in an Action.
        /// </summary>
        [Input("proxy")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesSplitsActionProxyArgs>? Proxy { get; set; }

        /// <summary>
        /// ActionRedirect defines a redirect in an Action.
        /// </summary>
        [Input("redirect")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesSplitsActionRedirectArgs>? Redirect { get; set; }

        /// <summary>
        /// ActionReturn defines a return in an Action.
        /// </summary>
        [Input("return")]
        public Input<Pulumi.Kubernetes.Types.Inputs.K8s.V1.VirtualServerSpecRoutesSplitsActionReturnArgs>? Return { get; set; }

        public VirtualServerSpecRoutesSplitsActionArgs()
        {
        }
        public static new VirtualServerSpecRoutesSplitsActionArgs Empty => new VirtualServerSpecRoutesSplitsActionArgs();
    }
}
