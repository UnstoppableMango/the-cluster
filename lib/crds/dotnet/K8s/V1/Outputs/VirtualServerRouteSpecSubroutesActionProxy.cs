// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.K8s.V1
{

    /// <summary>
    /// ActionProxy defines a proxy in an Action.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerRouteSpecSubroutesActionProxy
    {
        /// <summary>
        /// ProxyRequestHeaders defines the request headers manipulation in an ActionProxy.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesActionProxyRequestHeaders RequestHeaders;
        /// <summary>
        /// ProxyResponseHeaders defines the response headers manipulation in an ActionProxy.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesActionProxyResponseHeaders ResponseHeaders;
        public readonly string RewritePath;
        public readonly string Upstream;

        [OutputConstructor]
        private VirtualServerRouteSpecSubroutesActionProxy(
            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesActionProxyRequestHeaders requestHeaders,

            Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerRouteSpecSubroutesActionProxyResponseHeaders responseHeaders,

            string rewritePath,

            string upstream)
        {
            RequestHeaders = requestHeaders;
            ResponseHeaders = responseHeaders;
            RewritePath = rewritePath;
            Upstream = upstream;
        }
    }
}