// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3
{

    /// <summary>
    /// Template describes the machines that will be created.
    /// </summary>
    public class MachineDeploymentSpecTemplateArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3.MachineDeploymentSpecTemplateMetadataArgs>? Metadata { get; set; }

        /// <summary>
        /// Specification of the desired behavior of the machine. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3.MachineDeploymentSpecTemplateSpecArgs>? Spec { get; set; }

        public MachineDeploymentSpecTemplateArgs()
        {
        }
        public static new MachineDeploymentSpecTemplateArgs Empty => new MachineDeploymentSpecTemplateArgs();
    }
}