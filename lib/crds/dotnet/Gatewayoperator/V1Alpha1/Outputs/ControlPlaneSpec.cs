// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1
{

    /// <summary>
    /// ControlPlaneSpec defines the desired state of ControlPlane
    /// </summary>
    [OutputType]
    public sealed class ControlPlaneSpec
    {
        /// <summary>
        /// DataPlanes refers to the named DataPlane objects which this ControlPlane is responsible for. Currently they must be in the same namespace as the Dataplane.
        /// </summary>
        public readonly string Dataplane;
        /// <summary>
        /// DeploymentOptions is a shared type used on objects to indicate that their configuration results in a Deployment which is managed by the Operator and includes options for managing Deployments such as the the number of replicas or pod options like container image and resource requirements. version, as well as Env variable overrides.
        /// </summary>
        public readonly Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeployment Deployment;
        /// <summary>
        /// GatewayClass indicates the Gateway resources which this ControlPlane should be responsible for configuring routes for (e.g. HTTPRoute, TCPRoute, UDPRoute, TLSRoute, e.t.c.). 
        ///  Required for the ControlPlane to have any effect: at least one Gateway must be present for configuration to be pushed to the data-plane and only Gateway resources can be used to identify data-plane entities.
        /// </summary>
        public readonly string GatewayClass;
        /// <summary>
        /// IngressClass enables support for the older Ingress resource and indicates which Ingress resources this ControlPlane should be responsible for. 
        ///  Routing configured this way will be applied to the Gateway resources indicated by GatewayClass. 
        ///  If omitted, Ingress resources will not be supported by the ControlPlane.
        /// </summary>
        public readonly string IngressClass;

        [OutputConstructor]
        private ControlPlaneSpec(
            string dataplane,

            Pulumi.Kubernetes.Types.Outputs.Gatewayoperator.V1Alpha1.ControlPlaneSpecDeployment deployment,

            string gatewayClass,

            string ingressClass)
        {
            Dataplane = dataplane;
            Deployment = deployment;
            GatewayClass = gatewayClass;
            IngressClass = ingressClass;
        }
    }
}
