// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Addons.V1Beta1
{
    /// <summary>
    /// ClusterResourceSet is the Schema for the clusterresourcesets API.
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:addons.cluster.x-k8s.io/v1beta1:ClusterResourceSet")]
    public partial class ClusterResourceSet : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// ClusterResourceSetSpec defines the desired state of ClusterResourceSet.
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Addons.V1Beta1.ClusterResourceSetSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// ClusterResourceSetStatus defines the observed state of ClusterResourceSet.
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Addons.V1Beta1.ClusterResourceSetStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a ClusterResourceSet resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public ClusterResourceSet(string name, Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:addons.cluster.x-k8s.io/v1beta1:ClusterResourceSet", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal ClusterResourceSet(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:addons.cluster.x-k8s.io/v1beta1:ClusterResourceSet", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private ClusterResourceSet(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:addons.cluster.x-k8s.io/v1beta1:ClusterResourceSet", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetArgs();
            args.ApiVersion = "addons.cluster.x-k8s.io/v1beta1";
            args.Kind = "ClusterResourceSet";
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
        /// Get an existing ClusterResourceSet resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static ClusterResourceSet Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new ClusterResourceSet(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1
{

    public class ClusterResourceSetArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// ClusterResourceSetSpec defines the desired state of ClusterResourceSet.
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetSpecArgs>? Spec { get; set; }

        /// <summary>
        /// ClusterResourceSetStatus defines the observed state of ClusterResourceSet.
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Addons.V1Beta1.ClusterResourceSetStatusArgs>? Status { get; set; }

        public ClusterResourceSetArgs()
        {
        }
        public static new ClusterResourceSetArgs Empty => new ClusterResourceSetArgs();
    }
}
