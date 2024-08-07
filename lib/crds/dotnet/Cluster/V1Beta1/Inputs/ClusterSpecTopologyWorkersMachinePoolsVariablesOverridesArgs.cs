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
    /// ClusterVariable can be used to customize the Cluster through patches. Each ClusterVariable is associated with a Variable definition in the ClusterClass `status` variables.
    /// </summary>
    public class ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// DefinitionFrom specifies where the definition of this Variable is from. DefinitionFrom is `inline` when the definition is from the ClusterClass `.spec.variables` or the name of a patch defined in the ClusterClass `.spec.patches` where the patch is external and provides external variables. This field is mandatory if the variable has `DefinitionsConflict: true` in ClusterClass `status.variables[]`
        /// </summary>
        [Input("definitionFrom")]
        public Input<string>? DefinitionFrom { get; set; }

        /// <summary>
        /// Name of the variable.
        /// </summary>
        [Input("name", required: true)]
        public Input<string> Name { get; set; } = null!;

        [Input("value", required: true)]
        private InputMap<object>? _value;

        /// <summary>
        /// Value of the variable. Note: the value will be validated against the schema of the corresponding ClusterClassVariable from the ClusterClass. Note: We have to use apiextensionsv1.JSON instead of a custom JSON type, because controller-tools has a hard-coded schema for apiextensionsv1.JSON which cannot be produced by another type via controller-tools, i.e. it is not possible to have no type field. Ref: https://github.com/kubernetes-sigs/controller-tools/blob/d0e03a142d0ecdd5491593e941ee1d6b5d91dba6/pkg/crd/known_types.go#L106-L111
        /// </summary>
        public InputMap<object> Value
        {
            get => _value ?? (_value = new InputMap<object>());
            set => _value = value;
        }

        public ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs()
        {
        }
        public static new ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs Empty => new ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs();
    }
}
