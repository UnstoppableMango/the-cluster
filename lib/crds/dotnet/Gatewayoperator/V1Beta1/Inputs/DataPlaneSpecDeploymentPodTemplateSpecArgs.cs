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
    /// PodTemplateSpec defines PodTemplateSpec for Deployment's pods. It's being applied on top of the generated Deployments using [StrategicMergePatch](https://pkg.go.dev/k8s.io/apimachinery/pkg/util/strategicpatch#StrategicMergePatch).
    /// </summary>
    public class DataPlaneSpecDeploymentPodTemplateSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecMetadataArgs>? Metadata { get; set; }

        /// <summary>
        /// Specification of the desired behavior of the pod. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneSpecDeploymentPodTemplateSpecSpecArgs>? Spec { get; set; }

        public DataPlaneSpecDeploymentPodTemplateSpecArgs()
        {
        }
        public static new DataPlaneSpecDeploymentPodTemplateSpecArgs Empty => new DataPlaneSpecDeploymentPodTemplateSpecArgs();
    }
}