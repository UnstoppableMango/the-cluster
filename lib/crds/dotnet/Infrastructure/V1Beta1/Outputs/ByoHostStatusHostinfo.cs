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
    /// HostDetails returns the platform details of the host.
    /// </summary>
    [OutputType]
    public sealed class ByoHostStatusHostinfo
    {
        /// <summary>
        /// The Architecture reported by the host.
        /// </summary>
        public readonly string Architecture;
        /// <summary>
        /// OS Image reported by the host.
        /// </summary>
        public readonly string Osimage;
        /// <summary>
        /// The Operating System reported by the host.
        /// </summary>
        public readonly string Osname;

        [OutputConstructor]
        private ByoHostStatusHostinfo(
            string architecture,

            string osimage,

            string osname)
        {
            Architecture = architecture;
            Osimage = osimage;
            Osname = osname;
        }
    }
}