// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3
{

    /// <summary>
    /// The deployment strategy to use to replace existing machine instances with new ones.
    /// </summary>
    public class MachinePoolSpecStrategyArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Rolling update config params. Present only if MachineDeploymentStrategyType = RollingUpdate.
        /// </summary>
        [Input("rollingUpdate")]
        public Input<Pulumi.Kubernetes.Types.Inputs.Cluster.V1Alpha3.MachinePoolSpecStrategyRollingUpdateArgs>? RollingUpdate { get; set; }

        /// <summary>
        /// Type of deployment. Currently the only supported strategy is "RollingUpdate". Default is RollingUpdate.
        /// </summary>
        [Input("type")]
        public Input<string>? Type { get; set; }

        public MachinePoolSpecStrategyArgs()
        {
        }
        public static new MachinePoolSpecStrategyArgs Empty => new MachinePoolSpecStrategyArgs();
    }
}