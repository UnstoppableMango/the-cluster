// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    public class K8sInstallerConfigTemplateSpecTemplateArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Spec is the specification of the desired behavior of the installer config.
        /// </summary>
        [Input("spec", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigTemplateSpecTemplateSpecArgs> Spec { get; set; } = null!;

        public K8sInstallerConfigTemplateSpecTemplateArgs()
        {
        }
        public static new K8sInstallerConfigTemplateSpecTemplateArgs Empty => new K8sInstallerConfigTemplateSpecTemplateArgs();
    }
}