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
    /// AddHeader defines an HTTP Header with an optional Always field to use with the add_header NGINX directive.
    /// </summary>
    public class VirtualServerSpecRoutesSplitsActionProxyResponseHeadersAddArgs : global::Pulumi.ResourceArgs
    {
        [Input("always")]
        public Input<bool>? Always { get; set; }

        [Input("name")]
        public Input<string>? Name { get; set; }

        [Input("value")]
        public Input<string>? Value { get; set; }

        public VirtualServerSpecRoutesSplitsActionProxyResponseHeadersAddArgs()
        {
        }
        public static new VirtualServerSpecRoutesSplitsActionProxyResponseHeadersAddArgs Empty => new VirtualServerSpecRoutesSplitsActionProxyResponseHeadersAddArgs();
    }
}
