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
    /// SessionParameters defines session parameters.
    /// </summary>
    [OutputType]
    public sealed class TransportServerSpecSessionParameters
    {
        public readonly string Timeout;

        [OutputConstructor]
        private TransportServerSpecSessionParameters(string timeout)
        {
            Timeout = timeout;
        }
    }
}