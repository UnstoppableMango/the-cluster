// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.TheClusterCrds.Metallb.V1Beta2
{
    /// <summary>
    /// BGPPeer is the Schema for the peers API.
    /// </summary>
    [TheClusterCrdsResourceType("kubernetes:metallb.io/v1beta2:BGPPeer")]
    public partial class BGPPeer : KubernetesResource
    {
        [Output("apiVersion")]
        public Output<string> ApiVersion { get; private set; } = null!;

        [Output("kind")]
        public Output<string> Kind { get; private set; } = null!;

        [Output("metadata")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Meta.V1.ObjectMeta> Metadata { get; private set; } = null!;

        /// <summary>
        /// BGPPeerSpec defines the desired state of Peer.
        /// </summary>
        [Output("spec")]
        public Output<Pulumi.Kubernetes.Types.Outputs.Metallb.V1Beta2.BGPPeerSpec> Spec { get; private set; } = null!;

        /// <summary>
        /// BGPPeerStatus defines the observed state of Peer.
        /// </summary>
        [Output("status")]
        public Output<ImmutableDictionary<string, object>> Status { get; private set; } = null!;


        /// <summary>
        /// Create a BGPPeer resource with the given unique name, arguments, and options.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resource</param>
        /// <param name="args">The arguments used to populate this resource's properties</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public BGPPeer(string name, Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2.BGPPeerArgs? args = null, CustomResourceOptions? options = null)
            : base("kubernetes:metallb.io/v1beta2:BGPPeer", name, MakeArgs(args), MakeResourceOptions(options, ""))
        {
        }
        internal BGPPeer(string name, ImmutableDictionary<string, object?> dictionary, CustomResourceOptions? options = null)
            : base("kubernetes:metallb.io/v1beta2:BGPPeer", name, new DictionaryResourceArgs(dictionary), MakeResourceOptions(options, ""))
        {
        }

        private BGPPeer(string name, Input<string> id, CustomResourceOptions? options = null)
            : base("kubernetes:metallb.io/v1beta2:BGPPeer", name, null, MakeResourceOptions(options, id))
        {
        }

        private static Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2.BGPPeerArgs? MakeArgs(Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2.BGPPeerArgs? args)
        {
            args ??= new Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2.BGPPeerArgs();
            args.ApiVersion = "metallb.io/v1beta2";
            args.Kind = "BGPPeer";
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
        /// Get an existing BGPPeer resource's state with the given name, ID, and optional extra
        /// properties used to qualify the lookup.
        /// </summary>
        ///
        /// <param name="name">The unique name of the resulting resource.</param>
        /// <param name="id">The unique provider ID of the resource to lookup.</param>
        /// <param name="options">A bag of options that control this resource's behavior</param>
        public static BGPPeer Get(string name, Input<string> id, CustomResourceOptions? options = null)
        {
            return new BGPPeer(name, id, options);
        }
    }
}
namespace Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2
{

    public class BGPPeerArgs : global::Pulumi.ResourceArgs
    {
        [Input("apiVersion")]
        public Input<string>? ApiVersion { get; set; }

        [Input("kind")]
        public Input<string>? Kind { get; set; }

        [Input("metadata")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Meta.V1.ObjectMetaArgs>? Metadata { get; set; }

        /// <summary>
        /// BGPPeerSpec defines the desired state of Peer.
        /// </summary>
        [Input("spec")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Metallb.V1Beta2.BGPPeerSpecArgs>? Spec { get; set; }

        [Input("status")]
        private InputMap<object>? _status;

        /// <summary>
        /// BGPPeerStatus defines the observed state of Peer.
        /// </summary>
        public InputMap<object> Status
        {
            get => _status ?? (_status = new InputMap<object>());
            set => _status = value;
        }

        public BGPPeerArgs()
        {
        }
        public static new BGPPeerArgs Empty => new BGPPeerArgs();
    }
}