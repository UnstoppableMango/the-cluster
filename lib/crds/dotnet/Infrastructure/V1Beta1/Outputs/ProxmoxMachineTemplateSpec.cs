// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// ProxmoxMachineTemplateSpec defines the desired state of ProxmoxMachineTemplate
    /// </summary>
    [OutputType]
    public sealed class ProxmoxMachineTemplateSpec
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplate Template;

        [OutputConstructor]
        private ProxmoxMachineTemplateSpec(Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.ProxmoxMachineTemplateSpecTemplate template)
        {
            Template = template;
        }
    }
}