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
    /// AdminAPI contains the name and the address of the preview service for Admin API. Using this service users can send requests to configure the DataPlane's preview deployment.
    /// </summary>
    public class DataPlaneStatusRolloutServicesAdminApiArgs : global::Pulumi.ResourceArgs
    {
        [Input("addresses")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesAdminApiAddressesArgs>? _addresses;

        /// <summary>
        /// Addresses contains the addresses of a Service.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesAdminApiAddressesArgs> Addresses
        {
            get => _addresses ?? (_addresses = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesAdminApiAddressesArgs>());
            set => _addresses = value;
        }

        /// <summary>
        /// Name indicates the name of the service.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        public DataPlaneStatusRolloutServicesAdminApiArgs()
        {
        }
        public static new DataPlaneStatusRolloutServicesAdminApiArgs Empty => new DataPlaneStatusRolloutServicesAdminApiArgs();
    }
}