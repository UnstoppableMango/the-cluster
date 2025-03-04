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
    /// HTTPHeader describes a custom header to be used in HTTP probes
    /// </summary>
    [OutputType]
    public sealed class GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersLifecyclePostStartHttpGetHttpHeaders
    {
        /// <summary>
        /// The header field name. This will be canonicalized upon output, so case-variant names will be understood as the same header.
        /// </summary>
        public readonly string Name;
        /// <summary>
        /// The header field value
        /// </summary>
        public readonly string Value;

        [OutputConstructor]
        private GatewayConfigurationSpecDataPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersLifecyclePostStartHttpGetHttpHeaders(
            string name,

            string value)
        {
            Name = name;
            Value = value;
        }
    }
}
