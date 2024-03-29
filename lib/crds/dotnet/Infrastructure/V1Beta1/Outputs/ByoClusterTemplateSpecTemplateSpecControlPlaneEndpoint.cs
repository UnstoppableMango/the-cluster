// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
    /// </summary>
    [OutputType]
    public sealed class ByoClusterTemplateSpecTemplateSpecControlPlaneEndpoint
    {
        /// <summary>
        /// Host is the hostname on which the API server is serving.
        /// </summary>
        public readonly string Host;
        /// <summary>
        /// Port is the port on which the API server is serving.
        /// </summary>
        public readonly int Port;

        [OutputConstructor]
        private ByoClusterTemplateSpecTemplateSpecControlPlaneEndpoint(
            string host,

            int port)
        {
            Host = host;
            Port = port;
        }
    }
}
