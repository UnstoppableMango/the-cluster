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
    /// SecretObjectReference identifies an API object including its namespace, defaulting to Secret. 
    ///  The API object must be valid in the cluster; the Group and Kind must be registered in the cluster for this reference to be valid. 
    ///  References to objects with invalid Group and Kind are not valid, and must be rejected by the implementation, with appropriate Conditions set on the containing object.
    /// </summary>
    public class GatewaySpecListenersTlsCertificateRefsArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Group is the group of the referent. For example, "gateway.networking.k8s.io". When unspecified or empty string, core API group is inferred.
        /// </summary>
        [Input("group")]
        public Input<string>? Group { get; set; }

        /// <summary>
        /// Kind is kind of the referent. For example "Secret".
        /// </summary>
        [Input("kind")]
        public Input<string>? Kind { get; set; }

        /// <summary>
        /// Name is the name of the referent.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        /// <summary>
        /// Namespace is the namespace of the referenced object. When unspecified, the local namespace is inferred. 
        ///  Note that when a namespace different than the local namespace is specified, a ReferenceGrant object is required in the referent namespace to allow that namespace's owner to accept the reference. See the ReferenceGrant documentation for details. 
        ///  Support: Core
        /// </summary>
        [Input("namespace")]
        public Input<string>? Namespace { get; set; }

        public GatewaySpecListenersTlsCertificateRefsArgs()
        {
            Group = "";
            Kind = "Secret";
        }
        public static new GatewaySpecListenersTlsCertificateRefsArgs Empty => new GatewaySpecListenersTlsCertificateRefsArgs();
    }
}