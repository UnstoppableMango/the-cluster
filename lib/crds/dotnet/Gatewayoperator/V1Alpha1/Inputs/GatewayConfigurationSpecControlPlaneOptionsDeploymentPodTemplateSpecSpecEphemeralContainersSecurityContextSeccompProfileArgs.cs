// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// The seccomp options to use by this container. If seccomp options are provided at both the pod &amp; container level, the container options override the pod options. Note that this field cannot be set when spec.os.name is windows.
    /// </summary>
    public class GatewayConfigurationSpecControlPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersSecurityContextSeccompProfileArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type.
        /// </summary>
        [Input("localhostProfile")]
        public Input<string>? LocalhostProfile { get; set; }

        /// <summary>
        /// type indicates which kind of seccomp profile will be applied. Valid options are: 
        ///  Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.
        /// </summary>
        [Input("type", required: true)]
        public Input<string> Type { get; set; } = null!;

        public GatewayConfigurationSpecControlPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersSecurityContextSeccompProfileArgs()
        {
        }
        public static new GatewayConfigurationSpecControlPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersSecurityContextSeccompProfileArgs Empty => new GatewayConfigurationSpecControlPlaneOptionsDeploymentPodTemplateSpecSpecEphemeralContainersSecurityContextSeccompProfileArgs();
    }
}