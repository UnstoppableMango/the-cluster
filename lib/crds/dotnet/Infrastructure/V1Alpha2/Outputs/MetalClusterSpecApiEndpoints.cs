// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Alpha2
{

    [OutputType]
    public sealed class MetalClusterSpecApiEndpoints
    {
        /// <summary>
        /// The hostname on which the API server is serving.
        /// </summary>
        public readonly string Host;
        /// <summary>
        /// The port on which the API server is serving.
        /// </summary>
        public readonly int Port;

        [OutputConstructor]
        private MetalClusterSpecApiEndpoints(
            string host,

            int port)
        {
            Host = host;
            Port = port;
        }
    }
}