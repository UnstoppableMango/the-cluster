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
    /// PodTemplateSpec defines PodTemplateSpec for Deployment's pods.
    /// </summary>
    public class ControlPlaneSpecDeploymentPodTemplateSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecMetadataArgs>? Metadata { get; set; }

        /// <summary>
        /// Specification of the desired behavior of the pod. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeploymentPodTemplateSpecSpecArgs>? Spec { get; set; }

        public ControlPlaneSpecDeploymentPodTemplateSpecArgs()
        {
        }
        public static new ControlPlaneSpecDeploymentPodTemplateSpecArgs Empty => new ControlPlaneSpecDeploymentPodTemplateSpecArgs();
    }
}