// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Gateway.V1
{
    /// <summary>
    /// HTTPRoute provides a way to route HTTP requests. This includes the capability to match requests by hostname, path, header, or query param. Filters can be used to specify additional processing steps. Backends specify where matching requests should be routed.
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:gateway.networking.k8s.io/v1:HTTPRoute")]
    public partial class HTTPRoute : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// Spec defines the desired state of HTTPRoute.
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// Status defines the current state of HTTPRoute.
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Gateway.V1.HTTPRouteStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a HTTPRoute resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public HTTPRoute(string name, Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1:HTTPRoute", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal HTTPRoute(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1:HTTPRoute", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private HTTPRoute(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1:HTTPRoute", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteArgs();
            args.ApiVersion = "gateway.networking.k8s.io/v1";
            args.Kind = "HTTPRoute";
            return args;
        }

        private static CustomResourceOptions MakeResourceOptions(CustomResourceOptions? options, Input<string>? id)
        {
            var defaultOptions = new CustomResourceOptions
            {
                Version = Utilities.Version,
            };
            var merged = CustomResourceOptions.Merge(defaultOptions, options);
            // Override the ID if one was specified for consistency with other language SDKs.
            merged.Id = id ?? merged.Id;
            return merged;
        }
        /// <summary>
        /// Get an existing HTTPRoute resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static HTTPRoute Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new HTTPRoute(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1
{

    public class HTTPRouteArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// Spec defines the desired state of HTTPRoute.
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteSpecArgs>? Spec { get; set; }

        /// <summary>
        /// Status defines the current state of HTTPRoute.
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1.HTTPRouteStatusArgs>? Status { get; set; }

        public HTTPRouteArgs()
        {
        }
        public static new HTTPRouteArgs Empty => new HTTPRouteArgs();
    }
}
