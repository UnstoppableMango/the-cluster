// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// HostAlias holds the mapping between IP and hostnames that will be injected as an entry in the pod's hosts file.
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecHostAliases
    {
        /// <summary>
        /// Hostnames for the above IP address.
        /// </summary>
        public readonly ImmutableArray<string> Hostnames;
        /// <summary>
        /// IP address of the host file entry.
        /// </summary>
        public readonly string Ip;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecHostAliases(
            ImmutableArray<string> hostnames,

            string ip)
        {
            Hostnames = hostnames;
            Ip = ip;
        }
    }
}
