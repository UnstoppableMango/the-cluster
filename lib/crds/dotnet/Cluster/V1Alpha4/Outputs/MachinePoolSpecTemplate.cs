// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4
{

    /// <summary>
    /// Template describes the machines that will be created.
    /// </summary>
    [OutputType]
    public sealed class MachinePoolSpecTemplate
    {
        /// <summary>
        /// Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplateMetadata Metadata;
        /// <summary>
        /// Specification of the desired behavior of the machine. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplateSpec Spec;

        [OutputConstructor]
        private MachinePoolSpecTemplate(
            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplateMetadata metadata,

            Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.MachinePoolSpecTemplateSpec spec)
        {
            Metadata = metadata;
            Spec = spec;
        }
    }
}
