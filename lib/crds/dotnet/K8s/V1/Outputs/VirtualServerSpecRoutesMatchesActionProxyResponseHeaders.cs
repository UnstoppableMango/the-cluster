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
    public sealed class VirtualServerSpecRoutesMatchesActionProxyResponseHeaders
    {
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesMatchesActionProxyResponseHeadersAdd> Add;
        public readonly ImmutableArray<string> Hide;
        public readonly ImmutableArray<string> Ignore;
        public readonly ImmutableArray<string> Pass;

        [OutputConstructor]
        private VirtualServerSpecRoutesMatchesActionProxyResponseHeaders(
            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesMatchesActionProxyResponseHeadersAdd> add,

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