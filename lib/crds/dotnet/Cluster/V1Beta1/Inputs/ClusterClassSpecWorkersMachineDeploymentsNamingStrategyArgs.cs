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
    /// NamingStrategy allows changing the naming pattern used when creating the MachineDeployment.
    /// </summary>
    public class ClusterClassSpecWorkersMachineDeploymentsNamingStrategyArgs : global::Pulumi.ResourceArgs
    {
        /// <summary>
        /// Template defines the template to use for generating the name of the MachineDeployment object. If not defined, it will fallback to `{{ .cluster.name }}-{{ .machineDeployment.topologyName }}-{{ .random }}`. If the templated string exceeds 63 characters, it will be trimmed to 58 characters and will get concatenated with a random suffix of length 5. The templating mechanism provides the following arguments: * `.cluster.name`: The name of the cluster object. * `.random`: A random alphanumeric string, without vowels, of length 5. * `.machineDeployment.topologyName`: The name of the MachineDeployment topology (Cluster.spec.topology.workers.machineDeployments[].name).
        /// </summary>
        [Input("template")]
        public Input<string>? Template { get; set; }

        public ClusterClassSpecWorkersMachineDeploymentsNamingStrategyArgs()
        {
        }
        public static new ClusterClassSpecWorkersMachineDeploymentsNamingStrategyArgs Empty => new ClusterClassSpecWorkersMachineDeploymentsNamingStrategyArgs();
    }
}
