// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1
{

    /// <summary>
    /// PatchDefinition defines a patch which is applied to customize the referenced templates.
    /// </summary>
    public class ClusterClassSpecPatchesDefinitionsArgs : global::Pulumi.ResourceArgs
    {
        [Input("jsonPatches", required: true)]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsJsonPatchesArgs>? _jsonPatches;

        /// <summary>
        /// JSONPatches defines the patches which should be applied on the templates matching the selector. Note: Patches will be applied in the order of the array.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsJsonPatchesArgs> JsonPatches
        {
            get => _jsonPatches ?? (_jsonPatches = new InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsJsonPatchesArgs>());
            set => _jsonPatches = value;
        }

        /// <summary>
        /// Selector defines on which templates the patch should be applied.
        /// </summary>
        [Input("selector", required: true)]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterClassSpecPatchesDefinitionsSelectorArgs> Selector { get; set; } = null!;

        public ClusterClassSpecPatchesDefinitionsArgs()
        {
        }
        public static new ClusterClassSpecPatchesDefinitionsArgs Empty => new ClusterClassSpecPatchesDefinitionsArgs();
    }
}