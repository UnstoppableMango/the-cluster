// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1
{

    /// <summary>
    /// Spec defines the desired state of GatewayClass.
    /// </summary>
    public class GatewayClassSpecArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// ControllerName is the name of the controller that is managing Gateways of this class. The value of this field MUST be a domain prefixed path. 
        ///  Example: "example.net/gateway-controller". 
        ///  This field is not mutable and cannot be empty. 
        ///  Support: Core
        /// </summary>
        [Input("controllerName", required: true)]
        public Input<string> ControllerName { get; set; } = null!;

        /// <summary>
        /// Description helps describe a GatewayClass with more details.
        /// </summary>
        [Input("description")]
        public Input<string>? Description { get; set; }

        /// <summary>
        /// ParametersRef is a reference to a resource that contains the configuration parameters corresponding to the GatewayClass. This is optional if the controller does not require any additional configuration. 
        ///  ParametersRef can reference a standard Kubernetes resource, i.e. ConfigMap, or an implementation-specific custom resource. The resource can be cluster-scoped or namespace-scoped. 
        ///  If the referent cannot be found, the GatewayClass's "InvalidParameters" status condition will be true. 
        ///  Support: Implementation-specific
        /// </summary>
        [Input("parametersRef")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.GatewayClassSpecParametersRefArgs>? ParametersRef { get; set; }

        public GatewayClassSpecArgs()
        {
        }
        public static new GatewayClassSpecArgs Empty => new GatewayClassSpecArgs();
    }
}