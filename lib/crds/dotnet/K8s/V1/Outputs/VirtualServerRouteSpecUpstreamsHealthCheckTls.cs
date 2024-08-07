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
    /// UpstreamTLS defines a TLS configuration for an Upstream.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerRouteSpecUpstreamsHealthCheckTls
    {
        public readonly bool Enable;

        [OutputConstructor]
        private VirtualServerRouteSpecUpstreamsHealthCheckTls(bool enable)
        {
            Enable = enable;
        }
    }
}
