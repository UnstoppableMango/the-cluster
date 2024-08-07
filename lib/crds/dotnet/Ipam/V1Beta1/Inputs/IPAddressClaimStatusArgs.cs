// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1
{

    /// <summary>
    /// IPAddressClaimStatus is the observed status of a IPAddressClaim.
    /// </summary>
    public class IPAddressClaimStatusArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// AddressRef is a reference to the address that was created for this claim.
        /// </summary>
        [Input("addressRef")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1.IPAddressClaimStatusAddressRefArgs>? AddressRef { get; set; }

        [Input("conditions")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1.IPAddressClaimStatusConditionsArgs>? _conditions;

        /// <summary>
        /// Conditions summarises the current state of the IPAddressClaim
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1.IPAddressClaimStatusConditionsArgs> Conditions
        {
            get => _conditions ?? (_conditions = new InputList<Pulumi.Kubernetes.Types.Inputs.Ipam.V1Beta1.IPAddressClaimStatusConditionsArgs>());
            set => _conditions = value;
        }

        public IPAddressClaimStatusArgs()
        {
        }
        public static new IPAddressClaimStatusArgs Empty => new IPAddressClaimStatusArgs();
    }
}
