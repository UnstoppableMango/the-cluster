// *** WARNING: this file was generated by crd2pulumi. ***
// *** Do not edit by hand unless you're certain you know what you are doing! ***

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi.Serialization;

namespace Pulumi.Kubernetes.Types.Outputs.Cluster.V1Beta1
{

    /// <summary>
    /// NamingStrategy allows changing the naming pattern used when creating the control plane provider object.
    /// </summary>
    [OutputType]
    public sealed class ClusterClassSpecControlPlaneNamingStrategy
    {
        /// <summary>
        /// Template defines the template to use for generating the name of the ControlPlane object. If not defined, it will fallback to `{{ .cluster.name }}-{{ .random }}`. If the templated string exceeds 63 characters, it will be trimmed to 58 characters and will get concatenated with a random suffix of length 5. The templating mechanism provides the following arguments: * `.cluster.name`: The name of the cluster object. * `.random`: A random alphanumeric string, without vowels, of length 5.
        /// </summary>
        public readonly string Template;

        [OutputConstructor]
        private ClusterClassSpecControlPlaneNamingStrategy(string template)
        {
            Template = template;
        }
    }
}