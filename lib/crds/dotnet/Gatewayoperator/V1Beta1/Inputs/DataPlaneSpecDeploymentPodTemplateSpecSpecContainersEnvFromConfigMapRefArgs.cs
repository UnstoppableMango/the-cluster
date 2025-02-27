// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1
{

    /// <summary>
    /// The ConfigMap to select from
    /// </summary>
    public class DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvFromConfigMapRefArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names TODO: Add other useful fields. apiVersion, kind, uid?
        /// </summary>
        [Input("name")]
        public Input<string>? Name { get; set; }

        /// <summary>
        /// Specify whether the ConfigMap must be defined
        /// </summary>
        [Input("optional")]
        public Input<bool>? Optional { get; set; }

        public DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvFromConfigMapRefArgs()
        {
        }
        public static new DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvFromConfigMapRefArgs Empty => new DataPlaneSpecDeploymentPodTemplateSpecSpecContainersEnvFromConfigMapRefArgs();
    }
}
