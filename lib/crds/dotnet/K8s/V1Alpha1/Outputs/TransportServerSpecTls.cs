// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.K8s.V1Alpha1
{

    /// <summary>
    /// TransportServerTLS defines TransportServerTLS configuration for a TransportServer.
    /// </summary>
    [OutputType]
    public sealed class TransportServerSpecTls
    {
        public readonly string Secret;

        [OutputConstructor]
        private TransportServerSpecTls(string secret)
        {
            Secret = secret;
        }
    }
}
