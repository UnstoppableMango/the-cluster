// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Infrastructure.V1Beta1
{
    /// <summary>
    /// K8sInstallerConfig is the Schema for the k8sinstallerconfigs API
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:K8sInstallerConfig")]
    public partial class K8sInstallerConfig : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// K8sInstallerConfigSpec defines the desired state of K8sInstallerConfig
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.K8sInstallerConfigSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// K8sInstallerConfigStatus defines the observed state of K8sInstallerConfig
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Infrastructure.V1Beta1.K8sInstallerConfigStatus> Status { get; private set; } = null!;


        /// <summary>
        /// Create a K8sInstallerConfig resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public K8sInstallerConfig(string name, Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:K8sInstallerConfig", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal K8sInstallerConfig(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:K8sInstallerConfig", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private K8sInstallerConfig(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:infrastructure.cluster.x-k8s.io/v1beta1:K8sInstallerConfig", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigArgs();
            args.ApiVersion = "infrastructure.cluster.x-k8s.io/v1beta1";
            args.Kind = "K8sInstallerConfig";
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
        /// Get an existing K8sInstallerConfig resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static K8sInstallerConfig Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new K8sInstallerConfig(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1
{

    public class K8sInstallerConfigArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// K8sInstallerConfigSpec defines the desired state of K8sInstallerConfig
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigSpecArgs>? Spec { get; set; }

        /// <summary>
        /// K8sInstallerConfigStatus defines the observed state of K8sInstallerConfig
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Infrastructure.V1Beta1.K8sInstallerConfigStatusArgs>? Status { get; set; }

        public K8sInstallerConfigArgs()
        {
        }
        public static new K8sInstallerConfigArgs Empty => new K8sInstallerConfigArgs();
    }
}
