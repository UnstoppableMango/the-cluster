// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Gateway.V1Beta1
{
    /// <summary>
    /// Gateway represents an instance of a service-traffic handling infrastructure by binding Listeners to a set of IP addresses.
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:gateway.networking.k8s.io/v1beta1:Gateway")]
    public partial class Gateway : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// Spec defines the desired state of Gateway.
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewaySpec> Spec { get; private set; } = null!;

        /// <summary>
        /// Status defines the current state of Gateway.
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Gateway.V1Beta1.GatewayStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a Gateway resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public Gateway(string name, Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1beta1:Gateway", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal Gateway(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1beta1:Gateway", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private Gateway(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:gateway.networking.k8s.io/v1beta1:Gateway", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayArgs();
            args.ApiVersion = "gateway.networking.k8s.io/v1beta1";
            args.Kind = "Gateway";
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
        /// Get an existing Gateway resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static Gateway Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new Gateway(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1
{

    public class GatewayArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// Spec defines the desired state of Gateway.
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewaySpecArgs>? Spec { get; set; }

        /// <summary>
        /// Status defines the current state of Gateway.
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Gateway.V1Beta1.GatewayStatusArgs>? Status { get; set; }

        public GatewayArgs()
        {
        }
        public static new GatewayArgs Empty => new GatewayArgs();
    }
}