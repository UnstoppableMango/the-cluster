// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    /// <summary>
    /// CloudInit defines options related to the bootstrapping systems where CloudInit is used.
    /// </summary>
    public class ProxmoxMachineSpecCloudInitArgs : global::Pulumi.ResourceArgs
    {
        [Input("user")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.ProxmoxMachineSpecCloudInitUserArgs>? User { get; set; }

        public ProxmoxMachineSpecCloudInitArgs()
        {
        }
        public static new ProxmoxMachineSpecCloudInitArgs Empty => new ProxmoxMachineSpecCloudInitArgs();
    }
}
