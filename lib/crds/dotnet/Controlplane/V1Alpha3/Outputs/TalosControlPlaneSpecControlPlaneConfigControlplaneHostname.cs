// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Controlplane.V1Alpha3
{

    /// <summary>
    /// Set hostname in the machine configuration to some value.
    /// </summary>
    [OutputType]
    public sealed class TalosControlPlaneSpecControlPlaneConfigControlplaneHostname
    {
        /// <summary>
        /// Source of the hostname. 
        ///  Allowed values: "MachineName" (use linked Machine's Name).
        /// </summary>
        public readonly string Source;

        [OutputConstructor]
        private TalosControlPlaneSpecControlPlaneConfigControlplaneHostname(string source)
        {
            Source = source;
        }
    }
}
