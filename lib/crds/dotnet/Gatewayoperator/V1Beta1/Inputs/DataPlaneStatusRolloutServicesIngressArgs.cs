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
    /// Ingress contains the name and the address of the preview service for ingress. Using this service users can send requests that will hit the preview deployment.
    /// </summary>
    public class DataPlaneStatusRolloutServicesIngressArgs : global::Pulumi.ResourceArgs
    {
        [Input("addresses")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesIngressAddressesArgs>? _addresses;

        /// <summary>
        /// Addresses contains the addresses of a Service.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesIngressAddressesArgs> Addresses
        {
            get => _addresses ?? (_addresses = new InputList<Pulumi.Kubernetes.Types.Inputs.Gatewayoperator.V1Beta1.DataPlaneStatusRolloutServicesIngressAddressesArgs>());
            set => _addresses = value;
        }

        /// <summary>
        /// Name indicates the name of the service.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        public DataPlaneStatusRolloutServicesIngressArgs()
        {
        }
        public static new DataPlaneStatusRolloutServicesIngressArgs Empty => new DataPlaneStatusRolloutServicesIngressArgs();
    }
}