// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Networking.V1Alpha1
{
    /// <summary>
    /// TunnelBinding is the Schema for the tunnelbindings API
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:networking.cfargotunnel.com/v1alpha1:TunnelBinding")]
    public partial class TunnelBinding : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// TunnelBindingStatus defines the observed state of TunnelBinding
        /// </summary>
        [Output("status")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Networking.V1Alpha1.TunnelBindingStatus> Status { get; private set; } = null!;

        [Output("subjects")]
        public Output<ImmutableArray<Pulumi.Kubernetes.Types.Outputs.Networking.V1Alpha1.TunnelBindingSubjects>> Subjects { get; private set; } = null!;

        /// <summary>
        /// TunnelRef defines the Tunnel TunnelBinding connects to
        /// </summary>
        [Output("tunnelRef")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Networking.V1Alpha1.TunnelBindingTunnelRef> TunnelRef { get; private set; } = null!;


        /// <summary>
        /// Create a TunnelBinding resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public TunnelBinding(string name, Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:networking.cfargotunnel.com/v1alpha1:TunnelBinding", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal TunnelBinding(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:networking.cfargotunnel.com/v1alpha1:TunnelBinding", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private TunnelBinding(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:networking.cfargotunnel.com/v1alpha1:TunnelBinding", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingArgs();
            args.ApiVersion = "networking.cfargotunnel.com/v1alpha1";
            args.Kind = "TunnelBinding";
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
        /// Get an existing TunnelBinding resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static TunnelBinding Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new TunnelBinding(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1
{

    public class TunnelBindingArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// TunnelBindingStatus defines the observed state of TunnelBinding
        /// </summary>
        [Input("status")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingStatusArgs>? Status { get; set; }

        [Input("subjects")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingSubjectsArgs>? _subjects;
        public InputList<Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingSubjectsArgs> Subjects
        {
            get => _subjects ?? (_subjects = new InputList<Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingSubjectsArgs>());
            set => _subjects = value;
        }

        /// <summary>
        /// TunnelRef defines the Tunnel TunnelBinding connects to
        /// </summary>
        [Input("tunnelRef")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Networking.V1Alpha1.TunnelBindingTunnelRefArgs>? TunnelRef { get; set; }

        public TunnelBindingArgs()
        {
        }
        public static new TunnelBindingArgs Empty => new TunnelBindingArgs();
    }
}