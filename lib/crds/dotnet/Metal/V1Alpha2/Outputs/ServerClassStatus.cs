// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Metal.V1Alpha2
{

    /// <summary>
    /// ServerClassStatus defines the observed state of ServerClass.
    /// </summary>
    [OutputType]
    public sealed class ServerClassStatus
    {
        public readonly ImmutableArray<string> ServersAvailable;
        public readonly ImmutableArray<string> ServersInUse;

        [OutputConstructor]
        private ServerClassStatus(
            ImmutableArray<string> serversAvailable,

            ImmutableArray<string> serversInUse)
        {
            ServersAvailable = serversAvailable;
            ServersInUse = serversInUse;
        }
    }
}