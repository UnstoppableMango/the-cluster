// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3
{

    /// <summary>
    /// TalosConfigTemplateResource defines the Template structure
    /// </summary>
    public class TalosConfigTemplateSpecTemplateArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// TalosConfigSpec defines the desired state of TalosConfig
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigTemplateSpecTemplateSpecArgs>? Spec { get; set; }

        public TalosConfigTemplateSpecTemplateArgs()
        {
        }
        public static new TalosConfigTemplateSpecTemplateArgs Empty => new TalosConfigTemplateSpecTemplateArgs();
    }
}
