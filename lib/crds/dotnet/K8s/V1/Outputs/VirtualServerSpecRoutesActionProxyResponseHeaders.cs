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
    /// ProxyResponseHeaders defines the response headers manipulation in an ActionProxy.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesActionProxyResponseHeaders
    {
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxyResponseHeadersAdd> Add;
        public readonly ImmutableArray<string> Hide;
        public readonly ImmutableArray<string> Ignore;
        public readonly ImmutableArray<string> Pass;

        [OutputConstructor]
        private VirtualServerSpecRoutesActionProxyResponseHeaders(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxyResponseHeadersAdd> add,

            ImmutableArray<string> hide,

            ImmutableArray<string> ignore,

            ImmutableArray<string> pass)
        {
            Add = add;
            Hide = hide;
            Ignore = ignore;
            Pass = pass;
        }
    }
}