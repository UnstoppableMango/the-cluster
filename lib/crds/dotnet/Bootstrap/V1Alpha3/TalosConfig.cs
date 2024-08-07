// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Bootstrap.V1Alpha3
{
    /// <summary>
    /// TalosConfig is the Schema for the talosconfigs API
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:bootstrap.cluster.x-k8s.io/v1alpha3:TalosConfig")]
    public partial class TalosConfig : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// TalosConfigSpec defines the desired state of TalosConfig
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Bootstrap.V1Alpha3.TalosConfigSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// TalosConfigStatus defines the observed state of TalosConfig
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Bootstrap.V1Alpha3.TalosConfigStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a TalosConfig resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public TalosConfig(string name, Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:bootstrap.cluster.x-k8s.io/v1alpha3:TalosConfig", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal TalosConfig(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:bootstrap.cluster.x-k8s.io/v1alpha3:TalosConfig", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private TalosConfig(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:bootstrap.cluster.x-k8s.io/v1alpha3:TalosConfig", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigArgs();
            args.ApiVersion = "bootstrap.cluster.x-k8s.io/v1alpha3";
            args.Kind = "TalosConfig";
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
        /// Get an existing TalosConfig resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static TalosConfig Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new TalosConfig(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3
{

    public class TalosConfigArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// TalosConfigSpec defines the desired state of TalosConfig
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigSpecArgs>? Spec { get; set; }

        /// <summary>
        /// TalosConfigStatus defines the observed state of TalosConfig
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Bootstrap.V1Alpha3.TalosConfigStatusArgs>? Status { get; set; }

        public TalosConfigArgs()
        {
        }
        public static new TalosConfigArgs Empty => new TalosConfigArgs();
    }
}
