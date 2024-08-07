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
    /// CloudInit defines options related to the bootstrapping systems where CloudInit is used.
    /// </summary>
    [OutputType]
    public sealed class ProxmoxMachineSpecCloudInit
    {
        public readonly Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.ProxmoxMachineSpecCloudInitUser User;

        [OutputConstructor]
        private ProxmoxMachineSpecCloudInit(Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.ProxmoxMachineSpecCloudInitUser user)
        {
            User = user;
        }
    }
}
