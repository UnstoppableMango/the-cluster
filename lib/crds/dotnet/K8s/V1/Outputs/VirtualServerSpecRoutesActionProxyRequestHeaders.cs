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
    /// ProxyRequestHeaders defines the request headers manipulation in an ActionProxy.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerSpecRoutesActionProxyRequestHeaders
    {
        public readonly bool Pass;
        public readonly ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxyRequestHeadersSet> Set;

        [OutputConstructor]
        private VirtualServerSpecRoutesActionProxyRequestHeaders(
            bool pass,

            ImmutableArray<Pulumi.Kubernetes.Types.Outputs.K8s.V1.VirtualServerSpecRoutesActionProxyRequestHeadersSet> set)
        {
            Pass = pass;
            Set = set;
        }
    }
}