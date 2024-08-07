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
    /// UpstreamQueue defines Queue Configuration for an Upstream.
    /// </summary>
    [OutputType]
    public sealed class VirtualServerRouteSpecUpstreamsQueue
    {
        public readonly int Size;
        public readonly string Timeout;

        [OutputConstructor]
        private VirtualServerRouteSpecUpstreamsQueue(
            int size,

            string timeout)
        {
            Size = size;
            Timeout = timeout;
        }
    }
}
