// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Cluster.V1Alpha4
{
    /// <summary>
    /// Cluster is the Schema for the clusters API.
    ///  Deprecated: This type will be removed in one of the next releases.
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:cluster.x-k8s.io/v1alpha4:Cluster")]
    public partial class Cluster : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// ClusterSpec defines the desired state of Cluster.
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// ClusterStatus defines the observed state of Cluster.
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Cluster.V1Alpha4.ClusterStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a Cluster resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public Cluster(string name, Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:cluster.x-k8s.io/v1alpha4:Cluster", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal Cluster(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:cluster.x-k8s.io/v1alpha4:Cluster", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private Cluster(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:cluster.x-k8s.io/v1alpha4:Cluster", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterArgs();
            args.ApiVersion = "cluster.x-k8s.io/v1alpha4";
            args.Kind = "Cluster";
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
        /// Get an existing Cluster resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static Cluster Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new Cluster(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4
{

    public class ClusterArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// ClusterSpec defines the desired state of Cluster.
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterSpecArgs>? Spec { get; set; }

        /// <summary>
        /// ClusterStatus defines the observed state of Cluster.
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha4.ClusterStatusArgs>? Status { get; set; }

        public ClusterArgs()
        {
        }
        public static new ClusterArgs Empty => new ClusterArgs();
    }
}