// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// The seccomp options to use by the containers in this pod. Note that this field cannot be set when spec.os.name is windows.
    /// </summary>
    [OutputType]
    public sealed class DataPlaneSpecDeploymentPodTemplateSpecSpecSecurityContextSeccompProfile
    {
        /// <summary>
        /// localhostProfile indicates a profile defined in a file on the node should be used. The profile must be preconfigured on the node to work. Must be a descending path, relative to the kubelet's configured seccomp profile location. Must be set if type is "Localhost". Must NOT be set for any other type.
        /// </summary>
        public readonly string LocalhostProfile;
        /// <summary>
        /// type indicates which kind of seccomp profile will be applied. Valid options are: 
        ///  Localhost - a profile defined in a file on the node should be used. RuntimeDefault - the container runtime default profile should be used. Unconfined - no profile should be applied.
        /// </summary>
        public readonly string Type;

        [OutputConstructor]
        private DataPlaneSpecDeploymentPodTemplateSpecSpecSecurityContextSeccompProfile(
            string localhostProfile,

            string type)
        {
            LocalhostProfile = localhostProfile;
            Type = type;
        }
    }
}