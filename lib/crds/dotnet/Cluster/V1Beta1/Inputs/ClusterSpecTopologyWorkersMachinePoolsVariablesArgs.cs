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
    /// Variables can be used to customize the MachinePool through patches.
    /// </summary>
    public class ClusterSpecTopologyWorkersMachinePoolsVariablesArgs : global::Pulumi.ResourceArgs
    {
        [Input("overrides")]
        private InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs>? _overrides;

        /// <summary>
        /// Overrides can be used to override Cluster level variables.
        /// </summary>
        public InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs> Overrides
        {
            get => _overrides ?? (_overrides = new InputList<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Beta1.ClusterSpecTopologyWorkersMachinePoolsVariablesOverridesArgs>());
            set => _overrides = value;
        }

        public ClusterSpecTopologyWorkersMachinePoolsVariablesArgs()
        {
        }
        public static new ClusterSpecTopologyWorkersMachinePoolsVariablesArgs Empty => new ClusterSpecTopologyWorkersMachinePoolsVariablesArgs();
    }
}