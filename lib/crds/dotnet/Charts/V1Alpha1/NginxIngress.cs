// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Charts.V1Alpha1
{
    /// <summary>
    /// NginxIngress is the Schema for the nginxingresses API
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:charts.nginx.org/v1alpha1:NginxIngress")]
    public partial class NginxIngress : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// Spec defines the desired state of NginxIngress
        /// </summary>
        [Output("spec")]
        public Output<ImmutableDictionary<string, object>> Spec { get; private set; } = null!;

        /// <summary>
        /// Status defines the observed state of NginxIngress
        /// </summary>
        [Output("status")]
        public Output<ImmutableDictionary<string, object>> Status { get; private set; } = null!;


        /// <summary>
        /// Create a NginxIngress resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public NginxIngress(string name, Pulumi.Kubernetes.Types.Inputs.Charts.V1Alpha1.NginxIngressArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:charts.nginx.org/v1alpha1:NginxIngress", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal NginxIngress(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:charts.nginx.org/v1alpha1:NginxIngress", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private NginxIngress(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:charts.nginx.org/v1alpha1:NginxIngress", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Charts.V1Alpha1.NginxIngressArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Charts.V1Alpha1.NginxIngressArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Charts.V1Alpha1.NginxIngressArgs();
            args.ApiVersion = "charts.nginx.org/v1alpha1";
            args.Kind = "NginxIngress";
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
        /// Get an existing NginxIngress resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static NginxIngress Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new NginxIngress(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Charts.V1Alpha1
{

    public class NginxIngressArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        [Input("spec")]
        private InputMap<object>? _spec;

        /// <summary>
        /// Spec defines the desired state of NginxIngress
        /// </summary>
        public InputMap<object> Spec
        {
            get => _spec ?? (_spec = new InputMap<object>());
            set => _spec = value;
        }

        [Input("status")]
        private InputMap<object>? _status;

        /// <summary>
        /// Status defines the observed state of NginxIngress
        /// </summary>
        public InputMap<object> Status
        {
            get => _status ?? (_status = new InputMap<object>());
            set => _status = value;
        }

        public NginxIngressArgs()
        {
        }
        public static new NginxIngressArgs Empty => new NginxIngressArgs();
    }
}