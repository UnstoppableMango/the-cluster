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
    /// MachineAddress contains information for the node's address.
    /// </summary>
    public class ProxmoxMachineStatusAddressesArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// The machine address.
        /// </summary>
        [Input("address", required: true)]
        public Input<string> Address { get; set; } = null!;

        /// <summary>
        /// Machine address type, one of Hostname, ExternalIP, InternalIP, ExternalDNS or InternalDNS.
        /// </summary>
        [Input("type", required: true)]
        public Input<string> Type { get; set; } = null!;

        public ProxmoxMachineStatusAddressesArgs()
        {
        }
        public static new ProxmoxMachineStatusAddressesArgs Empty => new ProxmoxMachineStatusAddressesArgs();
    }
}